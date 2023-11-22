import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose, {ObjectId} from 'mongoose';
import User, {IUser} from './models/user';
import Game, {IGame} from "./models/game";
import {getUserId, setUserId} from "./helpers";

const app = new Koa();
const router = new Router();

// MongoDB connection
void mongoose.connect('mongodb://localhost:27018', {dbName: 'rpsGame'});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Middlewares
app.use(bodyParser());

// Routes
router.get('/users', async (ctx) => {
	const search = ctx.request.query.search
	let query = {}

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
	const user = await User.findOne({
		$or: [
			{id: id},
			{_id: id},
		]
	});

	if (user == null) {
		throw new Error('user not found');
	}

	await setUserId(ctx, user._id);

	ctx.body = user;
});

router.post('/users', async (ctx) => {
	const user: IUser = new User({
		name: (<IUser>ctx.request.body).name,
		rating: 1000
	});
	const savedUser = await user.save();
	await setUserId(ctx, savedUser._id);
	ctx.body = user;
});

router.put('/users/:id', async (ctx) => {
	ctx.body = await User.findOneAndUpdate({
		$or: [
			{id: ctx.params.id},
			{_id: ctx.params.id},
		]
	}, <IUser>ctx.request.body);
});

router.delete('/users/:id', async (ctx) => {
	ctx.body = await User.findOneAndDelete({
		$or: [
			{id: ctx.params.id},
			{_id: ctx.params.id},
		]
	});
});

router.post('/games', async (ctx) => {
	const members = await User.find({
		$or: (<{ members: {id?: number, _id?: ObjectId }[] }>ctx.request.body).members
	});
	const game: IGame = new Game({
		members: members.map(m => m)
	});
	await game.save();
	ctx.body = game;
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
	const choice = (<{choice: number}>ctx.request.body).choice;
	const id = getUserId(ctx);
	ctx.body = await Game
		.findOneAndUpdate({
			$or: [{id: ctx.params.id}],
			'members._id': id
		}, {
			$set: {
				'members.$.choice': choice
			}
		});
});

// Attach Routes
app.use(router.routes()).use(router.allowedMethods());

// Start server
app.listen(3000, () => {
	console.log('Server running on port 3000');
});
