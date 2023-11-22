import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';
import User, { IUser } from './models/user';
import Game, {IGame} from "./models/game";

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

router.post('/users', async (ctx) => {
	const user: IUser = new User({
		name: (<IUser>ctx.request.body).name,
		rating: 1000
	});
	await user.save();
	ctx.body = user;
});

router.put('/users/:id', async (ctx) => {
	ctx.body = await User.findOneAndUpdate({id: ctx.params.id}, <IUser>ctx.request.body);
});

router.delete('/users/:id', async (ctx) => {
	ctx.body = await User.findOneAndDelete({id: ctx.params.id});
});

router.post('/games', async (ctx) => {
	const members = await User.find({
		$or: (<{ members: number[] }>ctx.request.body).members.map(id => ({id}))
	})
	const game: IGame = new Game({
		members: members.map(m => ({user: m}))
	});
	await game.save();
	ctx.body = game;
});

router.put('/games/:id', async (ctx) => {
	const choice = (<{choice: number}>ctx.request.body).choice;
	const id = "1"; // get cur user id
	const game = await Game.findOne({id: ctx.params.id}).populate('members.user');

	if (game == null) {
		return;
	}

	const member = game.members.find(m => m.user.id === id);

	if (member) {
		// Update the member's choice
		member.choice = choice;

		// Save the game document with the updated members array
		await game.save();
	}

	ctx.body = game;
});

// Attach Routes
app.use(router.routes()).use(router.allowedMethods());

// Start server
app.listen(3000, () => {
	console.log('Server running on port 3000');
});
