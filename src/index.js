import { Hono } from 'hono'
import { cors } from 'hono/cors'
import accounts from './handlers/accounts.js'
import { login } from './auth.js'

const app = new Hono()

app.use(cors())

// 主页面 - 漂亮前端
app.get('/', async (c) => {
    return c.html(await import('./frontend/admin.html').then(m => m.default(c.env)))
})

app.post('/login', login)
app.route('/api/accounts', accounts)

export default app
