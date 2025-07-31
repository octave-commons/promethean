import 'source-map-support/register.js';


console.log("Stuff and things...")
import { Bot } from "./bot";
// import * as dotenv from 'dotenv';
// dotenv.config({ path: '../../.env' });  // 👈 resolve from wherever you want
const AGENT_NAME = process.env.AGENT_NAME || "duck";

console.log("Starting",AGENT_NAME, "Cephalon")


const bot = new Bot({
    token: process.env.DISCORD_TOKEN as string,
    applicationId: process.env.DISCORD_CLIENT_USER_ID as string,
})
bot.start()
console.log(`Cephalon started for ${AGENT_NAME}`)
