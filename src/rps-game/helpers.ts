export enum Results {
	TIE='tie',
	WIN='win',
	LOSE='lose',
	STALEMATE='stalemate',
}

export enum RockPaperScissors {
	ROCK = 1,
	PAPER = 2,
	SCISSORS = 3,
}

export enum RockPaperScissorsLizardSpock {
	ROCK = 1,
	PAPER = 2,
	SCISSORS = 3,
	LIZARD = 4,
	SPOCK = 5
}

export const rpsDefeats = {
	1: [3],
	2: [1],
	3: [2]
};

export const rpslsDefeats = {
	1: [3, 4],
	2: [1, 5],
	3: [2, 4],
	4: [2, 5],
	5: [1, 3]
};

export type Key = string | number;

export type Defeats<T extends Key> = {
	[key in T]: T[];
};

export class RatingSystem {
	private readonly base: number;
	private readonly k: number;
	private readonly edge: number;
	constructor(
		base = 25,
		k = 0.05,
		edge = 200,
	) {
		this.base = base;
		this.k = k;
		this.edge = edge;
	}
	private getOpponentRating(opponentsRating: number[]): number {
		return Math.max(...opponentsRating);
	}
	calcDelta(userRating: number, opponentsRating: number[], win: boolean): number {
		const
			opponentRating = this.getOpponentRating(opponentsRating),
			diff = opponentRating - userRating,
			diffAbs = Math.abs(diff),
			sign = Math.sign(win ? diff : -diff),
			hundreds = ~~(diffAbs / this.edge),
			W = 1 + (sign * this.k),
			powW = Math.pow(W, hundreds);

		return Math.round(this.base * powW);
	}
	calcUserRating(userRating: number, opponentsRating: number[], win: boolean): number {
		const
			delta = this.calcDelta(userRating, opponentsRating, win);

		return win ? userRating + delta : Math.max(1, userRating - delta);
	}
}

export function getAverageWinLose(winners: number[], losers: number[]): [number, number] {
	const average = (arr: number[]) => ~~arr.reduce((p, e, _, a) => p + (e / a.length), 0)
	return [average(winners), average(losers)];
}

export const ratingSystem = new RatingSystem();
