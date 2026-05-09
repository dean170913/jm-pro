import { Hono } from 'hono'
import { cors } from 'hono/cors'
import accounts from './handlers/accounts.js'
import { login, authMiddleware } from './auth.js'

const app = new Hono()

app.use(cors())
app.get('/', (c) => c.html(await import('./frontend/admin.html').then(m => m.default)))

app.post('/login', login)

// 受保护路由
app.use('/api/*', authMiddleware)

app.route('/api/accounts', accounts)

export default app
