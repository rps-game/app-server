import Rules from "./rules";
import {ratingSystem, Results, RockPaperScissorsLizardSpock as rps, rpslsDefeats} from "./helpers";

const rules = new Rules([
	rps.ROCK,
	rps.PAPER,
	rps.SCISSORS,
	rps.LIZARD,
	rps.SPOCK,
], rpslsDefeats);

describe('rps-game', () => {
	describe('Rules', () => {
		it('calcWinner lose', () => {
			expect(rules.calcWinner(rps.ROCK, rps.PAPER)).toEqual([Results.LOSE, rps.PAPER]);
		});
		it('calcWinner win', () => {
			expect(rules.calcWinner(rps.PAPER, rps.ROCK)).toEqual([Results.WIN, rps.PAPER]);
		});
		it('calcWinner tie', () => {
			expect(rules.calcWinner(rps.PAPER, rps.PAPER)).toEqual([Results.TIE, rps.PAPER]);
		});
		it('calcWinnerMultiple win', () => {
			expect(rules.calcWinnerMultiple([rps.PAPER, rps.ROCK, rps.ROCK])).toEqual([Results.WIN, rps.PAPER]);
		});
		it('calcWinnerMultiple tie', () => {
			expect(rules.calcWinnerMultiple([rps.PAPER, rps.PAPER, rps.PAPER]))
				.toEqual([Results.TIE, rps.PAPER]);
		});
		it('calcWinnerMultiple stalemate', () => {
			expect(rules.calcWinnerMultiple([rps.PAPER, rps.ROCK, rps.SCISSORS]))
				.toEqual([Results.STALEMATE, new Set([rps.PAPER, rps.ROCK, rps.SCISSORS])]);
		});
	});

	describe('rating system', () => {
		it('calcDelta ranked noramal win', () => {
			expect(ratingSystem.calcDelta(1000, [1000], true)).toBe(25);
		});
		it('calcDelta ranked noramal lose', () => {
			expect(ratingSystem.calcDelta(1000, [1000], false)).toBe(25);
		});
		it('calcDelta ranked high win', () => {
			expect(ratingSystem.calcDelta(400, [1400], true)).toBe(32);
		});
		it('calcDelta ranked high lose', () => {
			expect(ratingSystem.calcDelta(400, [1400], false)).toBe(19);
		});
		it('calcUserRating normal win', () => {
			expect(ratingSystem.calcUserRating(1000, [1000], true)).toBe(1025)
		});
		it('calcUserRating normal lose', () => {
			expect(ratingSystem.calcUserRating(1000, [1000], false)).toBe(975)
		});
		it('calcUserRating high lose', () => {
			expect(ratingSystem.calcUserRating(1400, [400], false)).toBe(1368)
		});
		it('calcUserRating high lose', () => {
			expect(ratingSystem.calcUserRating(400, [1400], false)).toBe(381)
		});
	});
});
