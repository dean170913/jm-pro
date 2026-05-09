import { Hono } from 'hono'

const app = new Hono()

// 获取所有账号
app.get('/', async (c) => {
    const { DB } = c.env;
    try {
        const result = await DB.prepare("SELECT * FROM accounts ORDER BY created_at DESC").all();
        return c.json(result.results || []);
    } catch (e) {
        return c.json([], 500);
    }
});

// 添加账号
app.post('/', async (c) => {
    try {
        const { email, pass } = await c.req.json();
        const { DB } = c.env;

        const id = "acc_" + Date.now().toString(36);
        
        await DB.prepare(`
            INSERT INTO accounts (id, email, password, cost_thb, recharge_by, status, sale_status)
            VALUES (?, ?, ?, ?, 'admin', '未充值', '未售')
        `).bind(id, email, pass, 2490).run();

        return c.json({ success: true });
    } catch (e) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 删除账号
app.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const { DB } = c.env;
    await DB.prepare("DELETE FROM accounts WHERE id = ?").bind(id).run();
    return c.json({ success: true });
});

export default app;
