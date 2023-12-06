import type Koa from "koa";
import mongoose from "mongoose";

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

export const conn = mongoose.createConnection('mongodb://localhost:27018', {dbName: 'sessionsDB'})

export async function getChatId(tglogin: string): Promise<number> {
	const user = await conn.collection('sessions').findOne({'data.username': tglogin});

	if (user == null) {
		throw {message: 'User not authorized in bot'}
	}

	return user.data.id;
}

export function generateCode(): number {
	const a = [];
	for (let i = 0; i < 5; i ++) {
		a.push(~~(Math.random()*10));
	}

	if (a[0] === 0) {
		a[0] = 1;
	}

	return Number(a.join(''));
}
