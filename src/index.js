import { Hono } from 'hono'
import { cors } from 'hono/cors'
import accounts from './handlers/accounts.js'
import { login } from './auth.js'

const app = new Hono()

app.use(cors())

// ==================== 主页面 ====================
app.get('/', async (c) => {
    return c.html(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>JM PRO V7</title>
</head>
<body class="bg-slate-950 text-slate-200">
    <div class="max-w-7xl mx-auto p-8">
        <h1 class="text-4xl font-black mb-2">既梦跨境中台 V7</h1>
        <p class="text-emerald-400 mb-8">GitHub 多文件部署版</p>

        <!-- 快速入库 -->
        <div class="bg-slate-900 p-6 rounded-3xl mb-8 flex gap-4">
            <input id="email" placeholder="邮箱地址" class="flex-1 p-4 bg-slate-800 rounded-2xl outline-none">
            <input id="pass" placeholder="密码" class="w-64 p-4 bg-slate-800 rounded-2xl outline-none">
            <button onclick="addAccount()" class="bg-blue-600 hover:bg-blue-700 px-10 rounded-2xl font-bold">快速入库</button>
        </div>

        <div class="bg-slate-900 rounded-3xl overflow-hidden">
            <table class="w-full">
                <thead class="bg-slate-800">
                    <tr>
                        <th class="p-4 text-left">邮箱</th>
                        <th class="p-4">充值状态</th>
                        <th class="p-4">成本(฿)</th>
                        <th class="p-4">销售价(¥)</th>
                        <th class="p-4">销售状态</th>
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
            tbody.innerHTML = data.map(a => \`
                <tr>
                    <td class="p-4 font-mono">\${a.email}</td>
                    <td class="p-4">\${a.status || '未充值'}</td>
                    <td class="p-4">\${a.cost_thb || 2490}</td>
                    <td class="p-4">\${a.price_rmb || '-'}</td>
                    <td class="p-4">\${a.sale_status || '未售'}</td>
                    <td class="p-4">
                        <button onclick="deleteAcc('\${a.id}')" class="bg-red-600 px-4 py-1 rounded text-sm">删除</button>
                    </td>
                </tr>
            \`).join('');
        }

        async function addAccount() {
            const email = document.getElementById('email').value.trim();
            const pass = document.getElementById('pass').value.trim();
            if (!email || !pass) return alert('请填写邮箱和密码');

            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, pass })
            });

            if (res.ok) {
                alert('✅ 入库成功！');
                document.getElementById('email').value = '';
                document.getElementById('pass').value = '';
                loadAccounts();
            } else {
                alert('❌ 入库失败');
            }
        }

        async function deleteAcc(id) {
            if (!confirm('确定删除这条记录吗？')) return;
            await fetch('/api/accounts/' + id, { method: 'DELETE' });
            loadAccounts();
        }

        // 页面加载时获取数据
        loadAccounts();
    </script>
</body>
</html>
    `);
});

app.post('/login', login);
app.route('/api/accounts', accounts);

export default app;
