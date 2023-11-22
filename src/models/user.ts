import mongoose, {Schema, Document} from 'mongoose';
import Counter from "./counter";

export interface IUser extends Document {
	id: string;
	name: string;
	rating: number;
}

const UserSchema: Schema = new Schema({
	id: {
		type: String,
		unique: true,
		index: true
	},
	name: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 4, maxlength: 30 },
	rating: { type: Number, required: true },
});

UserSchema.pre('save',  async function (next) {
	const res = await Counter.findByIdAndUpdate({_id: 'userId'}, {$inc: { seq: 1} }, {new: true, upsert: true});

	if (res == null) {
		return next();
	}

	this.id = res.seq;

	return next()
});

export default mongoose.model<IUser>('User', UserSchema);
