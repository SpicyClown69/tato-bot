const { SlashCommandBuilder, MessageFlags, EmbedBuilder, StringSelectMenuBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder} = require('discord.js')
const config = require("../config.json")
const fs = require("fs")
const {potatobot} = require("../potatobot"); const pb = new potatobot(config)
const data = new SlashCommandBuilder()
	.setName('help')
	.setDescription("sends the help message for the mod")
const func = async (interaction) => {
	try {
        pb.faq(interaction)
	}
	catch (e) {
		console.log(e)
		await interaction.followUp({content: "An error has occured "+e, ephemeral: true})
	}
}



exports.data = data
exports.func = func
