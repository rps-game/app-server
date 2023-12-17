import Router from 'koa-router';
import User, {IUser} from '../models/user';
import passport, {requireAuth} from "../auth/passport";

const userRouter = new Router({
	prefix: '/api/v1'
});

// Routes
userRouter.get('/users', async (ctx) => {
	try {
		const search = ctx.request.query.search;
		const excludeMe = ctx.request.query.excludeMe;
		const query: Record<string, any> = {};
		let limit = Number(ctx.request.query.limit)
		limit = isNaN(limit) ? 5 : limit;

		if (excludeMe === 'true') {
			query.id = {$ne: ctx.state.user?.id};
		}

		if (typeof search == 'string') {
			query.$or = [
				{id: {$regex: new RegExp(search, 'i')}},
				{name: {$regex: new RegExp(search, 'i')}}
			];
		} else {
			ctx.body = await User.find(query).sort({rating: -1}).limit(limit);
			return;
		}

		ctx.body = await User.find(query).limit(limit);
	} catch (e) {
		console.error(e);
		ctx.body = e
	}
});

userRouter.get('/users/:id', requireAuth, async (ctx) => {
	const id = ctx.params.id;

	let user;

	try {
		user = await User.findById(id);
	} catch (e) {
		user = await User.findOne({id: id});
	}

	if (user == null) {
		ctx.status = 404;
		ctx.body = {message: 'User not found'}
		return;
	}

	ctx.body = user;
});

userRouter.put('/users/:id', requireAuth, async (ctx) => {
	try {
		const id = ctx.params.id
		let user;

		try {
			user = await User.findOneAndUpdate({_id: id}, <IUser>ctx.request.body, {new: true});
		} catch (e) {
			user = await User.findOneAndUpdate({id}, <IUser>ctx.request.body, {new: true});
		}

		ctx.body = user;
	} catch (e) {
		ctx.status = 400;
		ctx.body = { message: 'Invalid request' }
	}
});

export default userRouter;
