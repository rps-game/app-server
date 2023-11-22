import type Koa from "koa";
import User from "./models/user";

export function getUserId(ctx: Koa.ParameterizedContext): string {
	const userId = ctx.cookies.get('userId');
	if (userId == null) {
		throw new Error('userId not found');
	}

	return userId;
}

export async function setUserId(ctx: Koa.ParameterizedContext, id: string): Promise<void> {
	const farFuture = new Date(new Date().getTime() + (10 * 365 * 24 * 60 * 60 * 1000)); // 10 years

	ctx.cookies.set('userId', id, {
		expires: farFuture,
		httpOnly: true, // Recommended for security (not accessible via JavaScript)
		secure: process.env.NODE_ENV === 'production', // Recommended to send the cookie over HTTPS only
	});
}
