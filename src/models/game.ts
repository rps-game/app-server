import mongoose, {Schema, Document} from 'mongoose';
import Counter from "./counter";
import {IUser} from "./user";

export interface IPlayer {
	choice?: number;
	user: IUser;
}

export interface IGame extends Document {
	id: number;
	members: IPlayer[];
	winner?: IPlayer;
}

const GameSchema: Schema = new Schema({
	id: {
		type: String,
		unique: true,
		index: true
	},
	members: [{choice: Number, user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}}],
	winner: {choice: Number, user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}}
});

GameSchema.pre('save',  async function (next) {
	if (!this.isNew) {
		return next()
	}

	const res = await Counter.findByIdAndUpdate({_id: 'gameId'}, {$inc: { seq: 1} }, {new: true, upsert: true});

	if (res == null) {
		return next();
	}

	this.id = res.seq;

	return next()
});

export default mongoose.model<IGame>('Game', GameSchema);
