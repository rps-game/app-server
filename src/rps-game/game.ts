import {Key, Results} from "./helpers";
import Rules, {rulesRPSLS} from "./rules";

export class Player<T extends Key> {
	protected _id: string;
	protected _option: T;

	constructor(id: string, option: T) {
		this._id = id;
		this._option = option;
	}

	get id(): string {
		return this._id;
	}

	get option(): T {
		return this._option;
	}

	set option(v: T) {
		this._option = v;
	}
}

export default class Game<T extends Key> {
	protected players: Player<T>[];
	protected rules: Rules<T>;
	constructor(rules: Rules<T>, players: Player<T>[]) {
		this.rules = rules;
		this.players = players;
	}

	addPlayers(players: Player<T>[]) {
		this.players.push(...players);
	}

	addPlayer(player: Player<T>) {
		this.players.push(player)
	}

	play(): [Results.TIE, T, string[], []] | [Results.STALEMATE, Set<T>, string[], []] | [Results.WIN, T, string[], string[]]  {
		if (this.players.length < 2) {
			throw Error('Not enough players');
		}

		for (const player of this.players) {
			if (player.option == null) {
				throw Error('Player without option');
			}
		}

		const
			options = this.players.map(el => el.option),
			[resValue, resOption] = this.rules.calcWinnerMultiple(options);

		if (resValue === Results.TIE) {
			return [resValue, resOption, this.players.map(el => el.id), []];
		} else if (resValue === Results.STALEMATE) {
			return [resValue, resOption, this.players.map(el => el.id), []];
		} else {
			const
				winners = this.players
					.filter((p) => p.option === resOption)
					.map(el => el.id),
				losers = this.players
					.filter((p) => p.option !== resOption)
					.map(el => el.id);

			return [resValue, resOption, winners, losers];
		}
	}
}

export const createRPSLSGame = (players: Player<number>[]) => new Game(rulesRPSLS, players);
