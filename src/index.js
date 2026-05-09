import { Hono } from 'hono'
import { cors } from 'hono/cors'
import accounts from './handlers/accounts.js'
import { login } from './auth.js'

const app = new Hono()

app.use(cors())

// 主页面
app.get('/', async (c) => {
    return c.html(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>JM PRO V7 - 多文件版</title>
</head>
<body class="bg-slate-950 text-slate-200 min-h-screen">
    <div class="max-w-7xl mx-auto p-8">
        <h1 class="text-4xl font-black mb-2">既梦跨境中台 V7</h1>
        <p class="text-emerald-400 mb-8">GitHub 多文件部署版</p>

        <!-- 快速入库 -->
        <div class="bg-slate-900 p-6 rounded-3xl mb-8 flex gap-4">
            <input id="email" placeholder="邮箱地址" class="flex-1 p-4 bg-slate-800 rounded-2xl outline-none">
            <input id="pass" placeholder="密码" class="w-64 p-4 bg-slate-800 rounded-2xl outline-none">
            <button onclick="addAccount()" class="bg-blue-600 hover:bg-blue-700 px-10 rounded-2xl font-bold">快速入库</button>
        </div>

        <div id="status" class="mb-4 text-emerald-400"></div>
    </div>

    <script>
        async function addAccount() {
            const email = document.getElementById('email').value.trim();
            const pass = document.getElementById('pass').value.trim();
            if (!email || !pass) return alert('邮箱和密码不能为空');

            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, pass })
            });

            if (res.ok) {
                document.getElementById('status').innerHTML = '✅ 入库成功！';
                document.getElementById('email').value = '';
                document.getElementById('pass').value = '';
            } else {
                alert('入库失败');
            }
        }
    </script>
</body>
</html>
    `)
})

app.post('/login', login)
app.route('/api/accounts', accounts)

export default app
