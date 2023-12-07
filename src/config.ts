import { config as dotenvConf } from 'dotenv';
import fs from "fs";

if (process.env.NODE_ENV !== 'production') {
	dotenvConf();
}

const
	BOT_TOKEN = String(process.env.BOT_TOKEN),
	SECRET_KEY = String(process.env.SECRET_KEY);

function getKeyFromFile(key: string): string {
	if (key.startsWith('/')) {
		key = fs.readFileSync(BOT_TOKEN).toString().trim();
	}

	return key;
}

/**
 * Настройки
 */
const config = {
	BOT_TOKEN: getKeyFromFile(BOT_TOKEN),
	ENV: String(process.env.NODE_ENV),
	MONGO_URI: String(process.env.MONGO_URI),
	SECRET_KEY: getKeyFromFile(SECRET_KEY),
	REQUIRE_UNIQUE_GAMES: Boolean(process.env.REQUIRE_UNIQUE_GAMES)
};

export default config;
