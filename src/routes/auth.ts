import User, {IUser} from "../models/user";
import {generateCode, getChatId} from "../helpers";
import axios from "axios";
import Router from 'koa-router';
import config from "../config";

const authRouter = new Router({
	prefix: '/api/v1'
});

authRouter.get('/logout', async (ctx) => {
	await ctx.logout();
	ctx.status = 204;
});

authRouter.post('/login', async (ctx) => {
	try {
		const requestBody = <IUser>ctx.request.body;

		if (requestBody.name == null) {
			ctx.status = 400;
			throw { message: 'Name is required' };
		} else if (requestBody.tglogin == null) {
			ctx.status = 400;
			throw { message: 'Tglogin is required' };
		}

		let user = await User.findOne({
			name: requestBody.name,
			tglogin: requestBody.tglogin,
		});

		const chatId = await getChatId(requestBody.tglogin);

		if (user == null) {
			user = new User({
				name: requestBody.name,
				tglogin: requestBody.tglogin,
				rating: 1000,
				chatId
			});
			ctx.status = 201;
		}

		ctx.body = user;
		const code = generateCode();
		user.passcode = code;
		await user.save();
		void axios.post(`https://api.telegram.org/bot${config.BOT_TOKEN}/sendMessage`, {chat_id: chatId, text: code})
	} catch (e: any) {
		console.error(e);
		ctx.body = e;
	}
});

authRouter.post('/code', async (ctx) => {
	try {
		const requestBody = <IUser>ctx.request.body;

		if (requestBody.name == null) {
			ctx.status = 400;
			throw { message: 'Name is required' };
		} else if (requestBody.tglogin == null) {
			ctx.status = 400;
			throw { message: 'Tglogin is required' };
		} else if (requestBody.passcode == null || requestBody.passcode === 0) {
			ctx.status = 400;
			throw { message: 'Passcode is required' };
		}

		const user = await User.findOne({
			name: requestBody.name,
			tglogin: requestBody.tglogin,
		});

		if (user == null) {
			ctx.status = 404;
			throw { message: 'User not find' }
		}

		await ctx.login(user, requestBody.passcode)
		ctx.status = 204;

	} catch (e: any) {
		ctx.body = e;
	}
});

export default authRouter;
