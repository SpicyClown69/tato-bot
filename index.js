const { EmbedBuilder } = require("@discordjs/builders");
const config = require("./config.json"); // i'll stick with this mid-to-decent solution
//const {} = require("discord.js") // of course lol
require("dotenv").config(); // .env is pretty standard, it's what discord uses so probably use that. (See: https://discord.js.org/docs/packages/discord.js/14.21.0/Client:Class#token. "this defaults to process.env.DISCORD_TOKEN")
const Potatobot = require("./potatobot.js");

const potatobot = new Potatobot();
potatobot.login(process.env.DISCORD_TOKEN);

process.on("uncaughtException", (e) => {
    potatobot.log({
        embeds: [
            new EmbedBuilder({
                title:e.name,
                description:e.message+"\n\nTraceback:\n"+e.stack,
                color:0xff0000
            })
        ]
    })
})