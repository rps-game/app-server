import User, {IUser} from "../models/user";
import { getChatId} from "../helpers";
import Router from 'koa-router';
import {sendCode} from "./helpers";
import passport, {requireAuth} from "../auth/passport";

const authRouter = new Router({
	prefix: '/api/v1'
});

authRouter.get('/logout', requireAuth, async (ctx) => {
	await ctx.logout();
	ctx.status = 204;
});

authRouter.post('/sign-up', async (ctx) => {
	try {
		const
			requestBody = <IUser>ctx.request.body,
			tglogin = requestBody.tglogin?.toLowerCase();

		if (requestBody.name == null) {
			ctx.status = 400;
			throw {message: 'Name is required'};
		} else if (tglogin == null) {
			ctx.status = 400;
			throw {message: 'Tglogin is required'};
		}

		const chatId = await getChatId(tglogin, ctx);
		const user = new User({
			name: requestBody.name,
			tglogin,
			rating: 1000,
			chatId,
		});

		sendCode(user);
		await user.save();

		ctx.body = user;
		ctx.status = 201;
	} catch (e) {
		if (ctx.status != 400) {
			ctx.status = 500;
		}

		ctx.body = e;
	}
});

authRouter.post('/login', async (ctx) => {
	try {
		const requestBody = <IUser>ctx.request.body;

		if (requestBody.tglogin == null) {
			ctx.status = 400;
			throw { message: 'Tglogin is required' };
		}

		const user = await User.findOne({
			tglogin: requestBody.tglogin.toLowerCase(),
		});

		if (user == null) {
			ctx.status = 404;
			throw {message: 'User not find'};
		}

		sendCode(user);
		await user.save();

		ctx.body = user;
	} catch (e: any) {
		console.error(e);
		ctx.body = e;
	}
});

authRouter.post('/code', passport.authenticate('local'), async (ctx) => {
	ctx.status = 204;
});

authRouter.get('/me', requireAuth, async (ctx) => {
	ctx.body = ctx.state.user;
});

export default authRouter;
