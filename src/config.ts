import { config as dotenvConf } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
	dotenvConf();
}

/**
 * Настройки
 */
const config = {
	BOT_TOKEN: String(process.env.BOT_TOKEN),
	ENV: String(process.env.NODE_ENV),
	MONGO_URI: String(process.env.MONGO_URI),
};

export default config;
