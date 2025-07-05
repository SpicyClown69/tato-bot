const {SlashCommandBuilder, ChatInputCommandInteraction} = require("discord.js")
require("dotenv").config()
module.exports = {
    "data": new SlashCommandBuilder().setName("subcount").setDescription("Gets the current subcount"),
    /** @param {ChatInputCommandInteraction} interaction */
    "func": async (interaction) => {

        // I moved this into a command for now because it doesn't even work yet lmao.

        const data = await( await fetch('https://www.googleapis.com/youtube/v3/channels?key='+process.env.YOUTUBE_KEY+'&part=statistics&forHandle=SpacePotatoee')).json();
        let subCount = data.items[0].statistics.subscriberCount;

        let slicedCount = subCount.slice(0, -2);
        let finalCount = slicedCount.slice(0, -1) + '.' + slicedCount.slice(-1) + 'K';
        
        await interaction.reply('Subscribers: ' + finalCount);
    }
}
