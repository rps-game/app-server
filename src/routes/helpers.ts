import {generateCode} from "../helpers";
import config from "../config";
import axios from "axios";
import { IUser } from "../models/user";

export function sendCode(user: IUser): void {
	const code = generateCode();
	user.passcode = code;
	void axios.post(`https://api.telegram.org/bot${config.BOT_TOKEN}/sendMessage`, {chat_id: user.chatId, text: code});
}
