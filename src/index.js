import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()
app.use(cors())

// ====================== 主页面 ======================
app.get('/', (c) => c.html(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>JM PRO V8</title>
</head>
<body class="bg-slate-950 text-slate-200">
    <div class="max-w-7xl mx-auto p-8">
        <h1 class="text-4xl font-black mb-8">既梦跨境中台 V8</h1>

        <!-- 快速入库 -->
        <div class="bg-slate-900 p-6 rounded-3xl mb-8 flex gap-4">
            <input id="email" placeholder="既梦账号" class="flex-1 p-4 bg-slate-800 rounded-2xl outline-none">
            <input id="pass" placeholder="既梦密码" class="w-48 p-4 bg-slate-800 rounded-2xl outline-none">
            <input id="email_pass" placeholder="邮箱密码" class="w-48 p-4 bg-slate-800 rounded-2xl outline-none">
            <button onclick="addAccount()" class="bg-blue-600 hover:bg-blue-700 px-10 rounded-2xl font-bold">快速入库</button>
        </div>

        <!-- 数据表格 -->
        <div class="bg-slate-900 rounded-3xl overflow-hidden">
            <table class="w-full">
                <thead class="bg-slate-800">
                    <tr>
                        <th class="p-4 text-left">既梦账号</th>
                        <th class="p-4">既梦密码</th>
                        <th class="p-4">邮箱密码</th>
                        <th class="p-4">充值状态</th>
                        <th class="p-4">成本(THB)</th>
                        <th class="p-4">销售价(¥)</th>
                        <th class="p-4">销售汇率</th>
                        <th class="p-4">是否出售</th>
                        <th class="p-4">利润(¥)</th>
                        <th class="p-4">备注</th>
                        <th class="p-4">操作</th>
                    </tr>
                </thead>
                <tbody id="tbody" class="divide-y divide-slate-700"></tbody>
            </table>
        </div>
    </div>

    <script>
        async function loadAccounts() {
            const res = await fetch('/api/accounts');
            const data = await res.json();
            const tbody = document.getElementById('tbody');
            tbody.innerHTML = data.map(a => createRow(a)).join('');
        }

        function createRow(a) {
            const profit = calculateProfit(a);
            return \`
                <tr id="row-\${a.id}">
                    <td class="p-4 font-mono">\${a.email}</td>
                    <td class="p-4">\${a.password || '-'}</td>
                    <td class="p-4">
                        <span class="password-hidden" data-pass="\${a.email_password || ''}">******</span>
                        <button onclick="togglePassword(this)" class="ml-2 text-xs text-blue-400">👁</button>
                    </td>
                    <td class="p-4">\${a.status || '未充值'}</td>
                    <td class="p-4">\${a.cost_thb || 2490}</td>
                    <td class="p-4">\${a.price_rmb || '-'}</td>
                    <td class="p-4">\${a.sale_rate || '4.73'}</td>
                    <td class="p-4">\${a.sale_status || '未售'}</td>
                    <td class="p-4 font-bold \${profit > 0 ? 'text-emerald-400' : 'text-red-400'}">\${profit}</td>
                    <td class="p-4">\${a.remark || '-'}</td>
                    <td class="p-4">
                        <button onclick="editRow('\${a.id}')" class="bg-blue-600 px-4 py-1 rounded mr-2 text-sm">编辑</button>
                        <button onclick="deleteAcc('\${a.id}')" class="bg-red-600 px-4 py-1 rounded text-sm">删除</button>
                    </td>
                </tr>
            \`;
        }

        function calculateProfit(a) {
            const price = Number(a.price_rmb) || 0;
            const cost = Number(a.cost_thb) || 2490;
            const rate = Number(a.sale_rate) || 4.73;
            return price > 0 ? (price - cost / rate).toFixed(2) : '-';
        }

        function togglePassword(btn) {
            const span = btn.previousElementSibling;
            if (span.classList.contains('password-hidden')) {
                span.textContent = span.dataset.pass;
                span.classList.remove('password-hidden');
            } else {
                span.textContent = '******';
                span.classList.add('password-hidden');
            }
        }

        async function addAccount() {
            const email = document.getElementById('email').value.trim();
            const pass = document.getElementById('pass').value.trim();
            const email_pass = document.getElementById('email_pass').value.trim();

            if (!email || !pass) return alert('既梦账号和密码不能为空');

            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password: pass, email_password: email_pass })
            });

            if (res.ok) {
                alert('✅ 入库成功');
                document.getElementById('email').value = '';
                document.getElementById('pass').value = '';
                document.getElementById('email_pass').value = '';
                loadAccounts();
            } else {
                alert('❌ 入库失败');
            }
        }

        async function deleteAcc(id) {
            if (!confirm('确定删除这条记录？')) return;
            await fetch('/api/accounts/' + id, { method: 'DELETE' });
            loadAccounts();
        }

        // 初始加载
        loadAccounts();
    </script>
</body>
</html>
`))

// ====================== API ======================
app.route('/api/accounts', accountsRouter)

const accountsRouter = new Hono()

accountsRouter.get('/', async (c) => {
    const { DB } = c.env;
    const result = await DB.prepare("SELECT * FROM accounts ORDER BY created_at DESC").all();
    return c.json(result.results || []);
});

accountsRouter.post('/', async (c) => {
    const { email, password, email_password } = await c.req.json();
    const { DB } = c.env;
    const id = "acc_" + Date.now().toString(36);

    await DB.prepare(`
        INSERT INTO accounts (id, email, password, email_password, recharge_by)
        VALUES (?, ?, ?, ?, 'admin')
    `).bind(id, email, password, email_password || '').run();

    return c.json({ success: true });
});

accountsRouter.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const { DB } = c.env;
    await DB.prepare("DELETE FROM accounts WHERE id = ?").bind(id).run();
    return c.json({ success: true });
});

export default app;
