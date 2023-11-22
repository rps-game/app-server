import mongoose, {Schema, Document} from 'mongoose';
import Counter from "./counter";
import {IUser} from "./user";

export interface IPlayer {
	id: string
	name: string;
	rating: string;
	choice?: number;
}

export interface IGame extends Document {
	id: string;
	members: IPlayer[];
	winner?: {
		choice: number;
		user: IUser;
	};
}

const GameSchema: Schema = new Schema({
	id: {
		type: String,
		unique: true,
		index: true
	},
	members: [{
		id: String,
		name: String,
		rating: Number,
		choice: Number,
	}],
	winner: {
		choice: Number,
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	}
});

GameSchema.pre('save',  async function (next) {
	if (!this.isNew || this.id != null) {
		return next()
	}

	const res = await Counter.findByIdAndUpdate(
		{_id: 'gameId'},
		{$inc: { seq: 1}},
		{new: true, upsert: true}
	);

	if (res == null) {
		return next();
	}

	this.id = res.seq;

	return next()
});

export default mongoose.model<IGame>('Game', GameSchema);
