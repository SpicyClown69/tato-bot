const { SlashCommandBuilder, MessageFlags, EmbedBuilder, StringSelectMenuBuilder, ButtonBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder} = require('discord.js')
const config = require("../config.json")
const fs = require("fs")
function createSelectOptions() {
    let buffer = []
    for (var i = 0; i < Object.keys(config.faq).length; i++) { // 4:20GMT istfg if i have to do the most jank ass solution to get this to work
        buffer.push({                                           // haha copied code
            label:(config.faq[ Object.keys(config.faq) [i] ].fields[0].name),
            value:(Object.keys(config.faq)[i].toString()) 
        })
    }
    return buffer
}
const selectOptions = createSelectOptions()

const data = new SlashCommandBuilder()
	.setName('help')
	.setDescription("sends the help message for the mod")
const func = async (interaction) => {
	try {
        const live_config = JSON.parse(fs.readFileSync("./config.json"))
        const filter = (i) => i.member.id === interaction.member.id
        const select = new StringSelectMenuBuilder()
            .setCustomId('faq')
            .setPlaceholder('Select a Question')
            //.setOptions(selectOptions.map(question => { return { label:question.label.toString(), value:question.value.toString()}}))
            .setOptions(selectOptions)

        
        const wiki = new ButtonBuilder()
            .setLabel("Backrooms Wiki")
            .setURL(config.links.wiki)
            .setStyle("Link")

        const mac_not_working = new ButtonBuilder()
            .setLabel("Use Mac?")
            .setURL(config.links.wiki_mac)
            .setStyle("Link")

        const tutorial = new ButtonBuilder()
            .setLabel("Video Tutorial")
            .setURL(config.links.wiki_install)
            .setStyle("Link")

        const modrinth = new ButtonBuilder()
            .setLabel("Modrinth Page")
            .setURL(config.links.modrinth)
            .setStyle("Link")

        const issues = new ButtonBuilder()
            .setLabel("READ | KNOWN ISSUES")
            .setCustomId("issues")
            .setStyle("Primary")
    
        const row = new ActionRowBuilder()
            .addComponents(issues, wiki, modrinth, mac_not_working, tutorial)
    
        const row2 = new ActionRowBuilder()
            .addComponents(select)

        const embed = new EmbedBuilder()
            .setColor(0xFFCC00)
            .setThumbnail(live_config.links.embed_image)
            .setTitle("Frequently Asked Questions")
            .addFields(
                { name:"What can I find here?", value:"You can find links to very important info below at all times.\nSelect your question below"}
            )
        
        const response = await interaction.reply({
            embeds: [embed] ,
            components: [row,row2],
            withResponse: true,
            ephemeral: true
        });

        const collector = response.resource.message.createMessageComponentCollector({ filter: filter, time: 240_000});

        collector.on('collect', async (i) => {
            const live_config = JSON.parse(fs.readFileSync("./config.json"))
            if (i.customId === "issues") {
                const embed = new EmbedBuilder()
                    .setTitle("Frequently Asked Questions")
                    .setColor(0xFFCC00)
                    .setThumbnail(live_config.links.embed_image)
                    .addFields(live_config.faq.important_note.fields)
                i.update({embeds:[embed], components:[row,row2], ephemeral: true})
                return
            }
            const selection = i.values[0];
            try {
                const embed = new EmbedBuilder()
                    .setTitle("Frequently Asked Questions")
                    .setColor(0xFFCC00)
                    .setThumbnail("https://cdn.modrinth.com/data/H6pjI7Ol/831ad01659612e42dc2adfe6bcf00b3a4a5515f4_96.webp")
                    .addFields(live_config.faq[selection].fields)
                i.update({embeds:[embed], components:[row,row2], ephemeral: true})
            } catch (e) {
                console.log(e)
            }
        });
	}
	catch (e) {
		console.log(e)
		await interaction.followUp({content: "An error has occured "+e, ephemeral: true})
	}
}



exports.data = data
exports.func = func