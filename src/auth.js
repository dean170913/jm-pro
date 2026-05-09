export async function login(c) {
    const { user, pass } = await c.req.json();
    // 简化版，后续会完善
    if (user === "admin" && pass === "admin123") {
        return c.json({ success: true }, {
            headers: { "Set-Cookie": `JM_SESSION=${user}; Path=/; HttpOnly; Max-Age=604800` }
        });
    }
    return c.json({ success: false }, 401);
}

export async function authMiddleware(c, next) {
    const cookie = c.req.header("Cookie") || "";
    if (cookie.includes("JM_SESSION=admin")) {
        return next();
    }
    return c.json({ error: "Unauthorized" }, 401);
}
