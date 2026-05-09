import { Hono } from 'hono'

const accounts = new Hono()

accounts.post('/', async (c) => {
    const { email, pass } = await c.req.json();
    const { DB } = c.env;

    const id = "acc_" + Date.now().toString(36);
    await DB.prepare(`
        INSERT INTO accounts (id, email, password, cost_thb, recharge_by, status, sale_status)
        VALUES (?, ?, ?, ?, 'admin', '未充值', '未售')
    `).bind(id, email, pass, 2490).run();

    return c.json({ success: true });
});

export default accounts;
