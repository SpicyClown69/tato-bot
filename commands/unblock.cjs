const { SlashCommandBuilder, MessageFlags, EmbedBuilder, StringSelectMenuBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder} = require('discord.js')
const fs = require("fs")
const data = new SlashCommandBuilder()
	.setName('unblock')
	.setDescription("used for unblocking the bot if you want to let it respond to your messages")
const func = async (interaction) => {
	try {
        const live_config = JSON.parse(fs.readFileSync("./config.json"))
        let blocklist = JSON.parse(fs.readFileSync("./blocklist.json"))
        if (blocklist.includes(interaction.user.id)) {

            blocklist.splice(blocklist.indexOf(interaction.user.id),1)
            fs.writeFileSync("./blocklist.json", JSON.stringify(blocklist, null, 4))

            const embed = new EmbedBuilder()
            .setTitle("You have unblocked this bot")
            .setColor(0x00FF00)
            .setThumbnail(live_config.links.embed_image)
            interaction.reply({embeds:[embed], ephemeral: true})
    
            return
        }

        const embed = new EmbedBuilder()
            .setTitle("You have not blocked this bot")
            .setColor(0xFF0000)
            .setThumbnail(live_config.links.embed_image)
            interaction.reply({embeds:[embed], ephemeral: true})

        return

	}
	catch (e) {
		console.log(e)
		await interaction.followUp({content: "An error has occured "+e, ephemeral: true})
	}
}



exports.data = data
exports.func = func