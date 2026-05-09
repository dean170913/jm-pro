import { Hono } from 'hono'
import { cors } from 'hono/cors'
import accounts from './handlers/accounts.js'
import { login } from './auth.js'

const app = new Hono()

app.use(cors())

// 前端主页面
app.get('/', async (c) => c.html(`
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
        <p class="text-emerald-400 mb-8">多文件架构 · GitHub 部署</p>
        
        <div class="bg-slate-900 p-8 rounded-3xl">
            <h2 class="text-2xl mb-6">快速入库</h2>
            <div class="flex gap-4">
                <input id="email" placeholder="邮箱" class="flex-1 bg-slate-800 p-4 rounded-2xl">
                <input id="pass" placeholder="密码" class="w-64 bg-slate-800 p-4 rounded-2xl">
                <button onclick="addAcc()" class="bg-blue-600 px-8 rounded-2xl font-bold">入库</button>
            </div>
        </div>
    </div>

    <script>
        async function addAcc() {
            const email = document.getElementById('email').value;
            const pass = document.getElementById('pass').value;
            if(!email || !pass) return alert('请填写完整');
            
            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, pass})
            });
            if(res.ok) alert('入库成功！');
            else alert('入库失败');
        }
    </script>
</body>
</html>
`))

app.post('/login', login)
app.route('/api/accounts', accounts)

export default app
