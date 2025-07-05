const {SlashCommandBuilder, ChatInputCommandInteraction} = require("discord.js")
module.exports = {
    "data": new SlashCommandBuilder()
                .setName("name")
                .setDescription("description"),
                // add params here. make sure the comma comes after the very last entry.
    /** @param {ChatInputCommandInteraction} interaction */
    "func": async (interaction) => {
        //code goes here
    }
}