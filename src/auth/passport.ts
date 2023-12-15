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

passport.use(new LocalStrategy({ usernameField: 'tglogin', passwordField: 'passcode' },
	async (tglogin, passcode, done) => {
		try {
			const user = await User.findOne({ tglogin });

			if (!user) {
				return done(null, false, { message: 'User not find' });
			}

			if (String(user.passcode) !== passcode) {
				return done(null, false, { message: 'Wrong passcode' });
			}

			return done(null, user);
		} catch (e) {
			done(e)
		}
	}
));

export function requireAuth(ctx: any,  next: Function) {
	if (ctx.isAuthenticated()) {
		return next();
	}

	ctx.status = 401;
	ctx.body = {message: 'Not authorized'};
}

export default passport;
