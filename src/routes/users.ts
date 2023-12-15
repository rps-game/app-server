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

		if (!search) {
			ctx.body = await User.find({id: {$ne: ctx.state.user?.id}}).sort({rating: -1}).limit(10);
			return;
		}

		let query = {};

		if (typeof search == 'string') {
			query = {
				$or: [
					{id: {$regex: new RegExp(search, 'i')}},
					{name: {$regex: new RegExp(search, 'i')}}
				],
				id: {
					$ne: ctx.state.user?.id
				}
			}
		}

		ctx.body = await User.find(query).limit(10);
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
