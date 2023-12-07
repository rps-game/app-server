import mongoose, {Schema, Document} from 'mongoose';
import Counter from "./counter";

export interface IUser extends Document {
	id: string;
	name: string;
	tglogin: string;
	rating: number;
	chatId: number;
	passcode?: number;
}

export const UserSchema: Schema = new Schema({
	id: {
		type: String,
		unique: true,
		index: true
	},
	tglogin: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
	},
	chatId: {
		required: true,
		type: Number,
		unique: true
	},
	passcode: {
		type: Number,
		min: 10000,
		max: 99999,
	},
	name: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
		minlength: 4,
		maxlength: 30
	},
	rating: { type: Number, required: true },
});

UserSchema.pre('save',  async function (next) {
	if (!this.isNew || this.id != null) {
		return next()
	}

	const res = await Counter
		.findByIdAndUpdate(
			{_id: 'userId'},
			{$inc: { seq: 1} },
			{new: true, upsert: true}
		);

	if (res == null) {
		return next();
	}

	this.id = res.seq;

	return next()
});

UserSchema.methods.toJSON = function() {
	const obj = this.toObject();
	delete obj.passcode;
	delete obj.chatId;
	return obj;
}

export default mongoose.model<IUser>('User', UserSchema);
