import {

	Results,
	RockPaperScissors,
	rpsDefeats,
	RockPaperScissorsLizardSpock,
	rpslsDefeats,
	Defeats,
	Key

} from './helpers';

const eqSet = <T>(xs: Set<T>, ys: Set<T>) =>
	xs.size === ys.size &&
	[...xs].every((x) => ys.has(x));

export default class Rules<T extends Key> {
	options: T[]
	defeats_dict: Defeats<T>;

	constructor(options: T[], defeats_dict: Defeats<T>) {
		this.options = options;
		this.defeats_dict = defeats_dict;
	}

	calcWinnerMultiple(options_list: T[]): [Results.TIE, T] | [Results.STALEMATE, Set<T>] | [Results.WIN, T] {
		if (options_list.length < 2) {
			throw new Error("Incorrect values");
		}
		for (let option of options_list) {
			if (!this.options.includes(option)) {
				throw new Error("Incorrect values");
			}
		}
		if (new Set(options_list).size === 1) {
			return [Results.TIE, options_list[0]];
		}
		let losers = new Set<T>();
		let ties = new Set<T>();
		let winners = new Set<T>();
		for (let i = 0; i < options_list.length; i++) {
			let option1 = options_list[i];
			for (let j = i + 1; j < options_list.length; j++) {
				let option2 = options_list[j];
				let [res_value, res_option] = this.calcWinner(option1, option2);
				if (res_value === Results.TIE) {
					ties.add(option1);
				} else if (res_value === Results.WIN) {
					winners.add(option1);
					losers.add(option2);
				} else {
					losers.add(option1);
					winners.add(option2);
				}
			}
		}

		if (eqSet(losers, winners)) {
			return [Results.STALEMATE, losers];
		} else {
			let winnerOption = Array.from(winners).find(o => !losers.has(o))!;
			return [Results.WIN, winnerOption];
		}
	}

	calcWinner(option1: T, option2: T): [Results, T] {
		if (!this.options.includes(option1) || !this.options.includes(option2)) {
			throw new Error("Incorrect values");
		}
		let defeats = this.defeats_dict[option1];
		if (defeats.includes(option2)) {
			return [Results.WIN, option1];
		} else if (option2 === option1) {
			return [Results.TIE, option1];
		} else {
			return [Results.LOSE, option2];
		}
	}
}

export const rulesRPS = new Rules([
	RockPaperScissors.ROCK,
	RockPaperScissors.PAPER,
	RockPaperScissors.SCISSORS,
], rpsDefeats);

export const rulesRPSLS = new Rules([
	RockPaperScissorsLizardSpock.ROCK,
	RockPaperScissorsLizardSpock.PAPER,
	RockPaperScissorsLizardSpock.SCISSORS,
	RockPaperScissorsLizardSpock.LIZARD,
	RockPaperScissorsLizardSpock.SPOCK,
], rpslsDefeats);


