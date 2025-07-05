const {SlashCommandBuilder, ChatInputCommandInteraction} = require("discord.js")
module.exports = {
    "data": new SlashCommandBuilder().setName("test").setDescription("Just a test command. Run this to test if the slash commands are working."),
    /** @param {ChatInputCommandInteraction} interaction */
    "func": async (interaction) => {
        interaction.reply({flags:["Ephemeral"],content:"Here is the test you ordered."})
    }
}