import Router from 'koa-router';
import User, {IUser} from '../models/user';

const userRouter = new Router({
	prefix: '/api/v1'
});

// Routes
userRouter.get('/users', async (ctx) => {
	try {
		if (ctx.isUnauthenticated()) {
			ctx.status = 401;
			throw {message: 'Not authorized'};
		}

		const search = ctx.request.query.search;

		if (!search) {
			ctx.status = 400;
			throw { message: 'Empty query' }
		}

		let query = {};

		if (typeof search == 'string') {
			query = {
				$or: [
					{id: {$regex: new RegExp(search, 'i')}},
					{name: {$regex: new RegExp(search, 'i')}}
				],
				id: {
					$ne: ctx.state.user.id
				}
			}
		}

		ctx.body = await User.find(query).limit(10);
	} catch (e) {
		ctx.body = e
	}
});

userRouter.get('/users/:id', async (ctx) => {
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

userRouter.put('/users/:id', async (ctx) => {
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
