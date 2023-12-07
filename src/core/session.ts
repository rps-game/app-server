import session from "koa-session";
import MongooseStore from './sessionStore';
import mongoose from "mongoose";
import config from "../config";

export default (app: any) => session({
	key: config.SECRET_KEY,
	maxAge: 86400000,
	overwrite: true,
	httpOnly: true,
	signed: true,
	rolling: false,
	store: MongooseStore.create({connection: mongoose.connection})
}, app)
