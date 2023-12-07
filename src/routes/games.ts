import User from "../models/user";
import {ObjectId} from "mongoose";
import Game, {IGame, IPlayer} from "../models/game";
import Router from 'koa-router';
import {createRPSLSGame, Player} from "../rps-game/game";
import {ratingSystem, Results} from "../rps-game/helpers";
import config from "../config";

const gamesRouter = new Router({
	prefix: '/api/v1'
});

gamesRouter.post('/games', async (ctx) => {
	try {
		if (ctx.isUnauthenticated()) {
			ctx.status = 401;
			throw {message: 'Not authorized'};
		}

		const query = (<{ members: {id?: number, _id?: ObjectId }[] }>ctx.request.body).members

		if (config.REQUIRE_UNIQUE_GAMES) {
			const gameExist = await Game.findOne({
				$and: query.map(el => ({'members.id': el.id})),
				$or: [
					{
						result: {$exists: false},
					},
					{
						'result.value': Results.WIN,
					},
				]
			});

			if (gameExist != null) {
				if (!(<{raise?: boolean}>ctx.request.body).raise) {
					ctx.body = gameExist;
					return;
				}

				ctx.status = 403;
				throw {message: 'Добавьте новых участников или замените старых'}
			}
		}

		const members = await User.find({
			$or: query
		});

		const game: IGame = new Game({
			members: [...members.map(({id, name}) => ({
				id,
				name,
			})), {
				id: ctx.state.user.id,
				name: ctx.state.user.name,
			}].reduce<IPlayer[]>((p, e) => {
				if (p.find(el => el.id === e.id)) {
					return p;
				}

				p.push(e);
				return p;
			}, [])
		});

		await game.save();
		ctx.status = 201;
		ctx.body = game;
	} catch (e) {
		console.log(e);
		ctx.body = e;
	}
});

gamesRouter.get('/games/pending', async (ctx) => {
	try {
		if (ctx.isUnauthenticated()) {
			ctx.status = 401;
			throw {message: 'Not authorized'};
		}

		const id = ctx.state.user.id;

		ctx.body = await Game.find({
			'members.id': id,
			members: {
				$elemMatch: {
					choice: {$exists: false}
				}
			}
		});
	} catch (e) {
		ctx.body = e
	}
});

gamesRouter.get('/games/history', async (ctx) => {
	try {
		if (ctx.isUnauthenticated()) {
			ctx.status = 401;
			throw {message: 'Not authorized'};
		}

		const id = ctx.state.user.id;

		ctx.body = await Game.find({
			'members.id': id,
			members: {
				$not: {
					$elemMatch: {
						choice: {$exists: false}
					}
				}
			}
		});
	} catch (e) {
		ctx.body = e
	}
});

gamesRouter.get('/games/:id', async (ctx) => {
	try {
		if (ctx.isUnauthenticated()) {
			ctx.status = 401;
			throw {message: 'Not authorized'};
		}

		const id = ctx.params.id;

		ctx.body = await Game.findOne({id});
	} catch (e) {
		ctx.body = e
	}
});

gamesRouter.put('/games/:id', async (ctx) => {
	try {
		if (ctx.isUnauthenticated()) {
			ctx.status = 401;
			throw {message: 'Not authorized'};
		}

		const id = ctx.state.user.id;
		const choice = (<{choice: number}>ctx.request.body).choice;
		const game = await Game
			.findOneAndUpdate({
				id: ctx.params.id,
				'members.id': id,
				// result: {$exists: false}
			}, {
				$set: {
					'members.$.choice': choice,
				}
			}, {new: true});

		if (game == null) {
			ctx.status = 404;
			throw {message: 'Game not found'};
		}

		const allPicked = game.members.every(el => el.choice != null);

		if (allPicked) {
			const
				gameRPSLS = createRPSLSGame(
					game.members.map(({id, choice}) => new Player(id, choice!))
				);

			const [result, choice, winnersIds] = gameRPSLS.play();
			const query: { $set: any } = {
				$set: {
					result: {
						value: result,
						choice: typeof choice === 'number' ? choice : Array.from(choice),
					}
				}
			};
			switch (result) {
				case Results.WIN:
					const
						membersIds = game.members.map(({id}) => ({id})),
						users = await User.find({$or:membersIds}),
						winners = users.filter(m => winnersIds.includes(m.id)),
						losers = users.filter(m => !winnersIds.includes(m.id));

					const updateUsers = users.map((u) => {
						const
							win = winnersIds.includes(u.id),
							opponentsRating = (win ? losers : winners).map(({rating}) => rating);

						u.rating = ratingSystem.calcUserRating(u.rating, opponentsRating, win);
						return u.save();
					});
					const members = game.toJSON().members.map(m => {
						const
							win = winnersIds.includes(m.id),
							opponentsRating = (win ? losers : winners).map(({rating}) => rating),
							user = users.find(e => e.id === m.id);

						m.delta = ratingSystem.calcDelta(user!.rating, opponentsRating, win);
						m.isWinner = win;
						return m;
					});
					await Promise.all(updateUsers);
					query.$set.members = members
					break;
				case Results.TIE:
				case Results.STALEMATE:
					break;
				default:
					ctx.status = 500;
					throw {message: 'Impossible game'};
			}

			ctx.body = await Game.findOneAndUpdate({
				id: ctx.params.id,
			}, [query], {new: true});

			return;
		}

		ctx.body = game;
	} catch (e) {
		console.error(e);
		ctx.body = e;
	}
});

export default gamesRouter;
