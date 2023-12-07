import session from "koa-session";
import MongooseStore from './sessionStore';
import mongoose from "mongoose";

export default (app: any) => session({
	key: 'sid',
	maxAge: 86400000,
	overwrite: true,
	httpOnly: true,
	signed: true,
	rolling: false,
	store: MongooseStore.create({connection: mongoose.connection})
}, app)
