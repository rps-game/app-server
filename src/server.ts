import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';
import cors from '@koa/cors';
import session from './core/session';
import passport from './auth/passport';

import gamesRouter from "./routes/games";
import authRouter from "./routes/auth";
import userRouter from "./routes/users";
import config from "./config";

const app = new Koa();

// MongoDB connection
const connectionString = `mongodb://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}?authSource=admin`;
void mongoose.connect(connectionString, {dbName: 'rpsGame'});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Middlewares
app.keys = [config.SECRET_KEY]
app.use(bodyParser());
app.use(cors());
app.use(session(app));
app.use(passport.initialize());
app.use(passport.session());

app.use((ctx, next) => {
	return next()
})

app.use(authRouter.routes()).use(authRouter.allowedMethods());
app.use(userRouter.routes()).use(userRouter.allowedMethods());
app.use(gamesRouter.routes()).use(gamesRouter.allowedMethods());

// Start server
app.listen(3000, () => {
	console.log('Server running on port 3000');
});
