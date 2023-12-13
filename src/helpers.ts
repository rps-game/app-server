import mongoose from "mongoose";

export const conn = mongoose.connection.useDb('sessionsDB')

export async function getChatId(tglogin: string, ctx: any): Promise<number> {
	const user = await conn.collection('sessions').findOne({'data.username': tglogin});

	if (user == null) {
		ctx.status = 400;
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
