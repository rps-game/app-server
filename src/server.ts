import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose, {ObjectId} from 'mongoose';
import User, {IUser} from './models/user';
import Game, {IGame} from "./models/game";
import {getUserId, setUserId} from "./helpers";
import cors from '@koa/cors';

const app = new Koa();
const router = new Router();

// MongoDB connection
void mongoose.connect('mongodb://localhost:27018', {dbName: 'rpsGame'});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Middlewares
app.use(bodyParser());
app.use(cors());

// Routes
router.get('/users', async (ctx) => {
	const search = ctx.request.query.search

	if (!search) {
		ctx.status = 400;
		ctx.body = { message: 'Empty query' }
		return;
	}

	let query = {};

	if (typeof search == 'string') {
		query = {
			$or: [
				{id: {$regex: new RegExp(search, 'i')}},
				{name: {$regex: new RegExp(search, 'i')}}
			]
		}
	}

	ctx.body = await User.find(query).limit(10);
});

router.get('/users/:id', async (ctx) => {
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

router.post('/users', async (ctx) => {
	try {
		const user: IUser = new User({
			name: (<IUser>ctx.request.body).name,
			rating: 1000
		});
		await user.save();
		ctx.status = 201;
		ctx.body = user;
	} catch (e) {
		ctx.status = 400;
		ctx.body = { message: 'User with that name already exists' }
	}
});

router.put('/users/:id', async (ctx) => {
	try {
		const id = ctx.params.id
		let user;

		try {
			user = await User.findOneAndUpdate({_id: id}, <IUser>ctx.request.body);
		} catch (e) {
			user = await User.findOneAndUpdate({id}, <IUser>ctx.request.body);
		}

		ctx.body = user;
	} catch (e) {
		ctx.status = 400;
		ctx.body = { message: 'Invalid request' }
	}
});

router.post('/games', async (ctx) => {
	try {
		const members = await User.find({
			$or: (<{ members: {id?: number, _id?: ObjectId }[] }>ctx.request.body).members
		});
		const game: IGame = new Game({
			members: members.map(m => m)
		});
		await game.save();
		ctx.status = 201;
		ctx.body = game;
	} catch (e) {
		ctx.status = 400;
		ctx.body = { message: 'Invalid request' }
	}
});

router.get('/games/pending', async (ctx) => {
	const _id = getUserId(ctx);

	ctx.body = await Game.find({
		'members._id': _id,
		members: {
			$elemMatch: {
				choice: {$exists: false}
			}
		}
	});
});

router.get('/games/history', async (ctx) => {
	const _id = getUserId(ctx);

	ctx.body = await Game.find({
		'members._id': _id,
		members: {
			$not: {
				$elemMatch: {
					choice: {$exists: false}
				}
			}
		}
	});
});

router.put('/games/:id', async (ctx) => {
	try {
		const choice = (<{choice: number}>ctx.request.body).choice;
		const id = getUserId(ctx);
		ctx.body = await Game
			.findOneAndUpdate({
				id: ctx.params.id,
				'members._id': id
			}, {
				$set: {
					'members.$.choice': choice
				}
			});
	} catch (e) {
		ctx.status = 400;
		ctx.body = { message: 'Invalid request' }
	}
});

// Attach Routes
app.use(router.routes()).use(router.allowedMethods());

// Start server
app.listen(3000, () => {
	console.log('Server running on port 3000');
});
