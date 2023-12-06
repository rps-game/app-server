import mongoose, {Schema} from "mongoose";

const schema = {
	_id: String,
	data: Object,
	updatedAt: {
		default: new Date(),
		expires: 86400, // 1 day
		type: Date
	}
};

export default class MongooseStore {
	session;
	constructor({
		collection = "sessions",
		expires = 86400,
		name = "Session"
	} = {}) {
		const updatedAt = { ...schema.updatedAt, expires };
		this.session = mongoose.model(
			name,
			new Schema({ ...schema, updatedAt }),
			collection
		);
	}

	async destroy(id: any) {
		const { session } = this;
		return session.deleteOne({ _id: id });
	}

	async get(id: any) {
		const { session } = this;
		const { data } = (await session.findById(id)) || {};
		return data;
	}

	async set(id: any, data: any, maxAge: any, { changed, rolling }: any) {
		if (changed || rolling) {
			const { session } = this;
			const record = { _id: id, data, updatedAt: new Date() };
			await session.findByIdAndUpdate(id, record, { upsert: true, safe: true });
		}

		return data;
	}

	static create(opts: any) {
		return new MongooseStore(opts);
	}
}

