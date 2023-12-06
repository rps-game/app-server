import passport from "koa-passport";
import {Strategy as LocalStrategy} from 'passport-local';
import User from '../models/user';

passport.serializeUser((user: any, done: any) => {
	done(null, user.id);
});

passport.deserializeUser(async (id: string, done: any) => {
	try {
		const user = await User.findOne({ id });
		if (!user) { return done(null, false); }
		done(null, user)
	} catch (e) {
		done(e)
	}
});

passport.use(new LocalStrategy(
	async (username, password, done) => {
		try {
			const user = await User.findOne({ name: username });
			if (!user) { return done(null, false); }
			if (String(user.passcode) !== password) { return done(null, false); }
			return done(null, user);
		} catch (e) {
			done(e)
		}
	}
));

export default passport;
