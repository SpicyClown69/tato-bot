const { ButtonBuilder } = require("@discordjs/builders");
const { StringSelectMenuBuilder } = require("@discordjs/builders");
const { ActionRowBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("@discordjs/builders");
const {SlashCommandBuilder, ChatInputCommandInteraction, ButtonStyle} = require("discord.js");
const config = require("../config.json");
module.exports = {
    "data": new SlashCommandBuilder()
                .setName("faq")
                .setDescription("If you need help with anything TaterBot related, use this command."),
    /** @param {ChatInputCommandInteraction} interaction */
    "func": async (interaction) => {
        let currentLevel = config.faq;

        let getOptions = () => {
            let components = [new ActionRowBuilder({
                components: [
                    new ButtonBuilder({
                        custom_id: "home",
                        label: "Home",
                        style: ButtonStyle.Primary
                    })
                ]
            })];
            if (currentLevel.options) {
                components.push(
                    new ActionRowBuilder({
                        components: [
                            new StringSelectMenuBuilder({
                                custom_id: "faq",
                                placeholder: "Choose a question",
                                options: Object.keys(currentLevel.options).map( f => ({
                                    label: currentLevel.options[f].title,
                                    value: f
                                }))
                            })
                        ]
                    })
                );
            }
            return {
                flags: ["Ephemeral"],
                embeds: [new EmbedBuilder()
                    .setTitle("Frequently Asked Questions")
                    .setDescription("\n__**"+currentLevel.title+"**__\n" + currentLevel.description)
                    .setImage(currentLevel.image)
                    .setColor(0xffcc00)
                    .setThumbnail(config.links.embed_image)],
                components: components
            };
        };

        const response = await interaction.reply(getOptions());
        const collector = response.createMessageComponentCollector();
        collector.on("collect", (interaction) => {
            switch (interaction.customId) {
                case "home": {
                    currentLevel = config.faq;
                    break;
                }
                case "faq": {
                    currentLevel = currentLevel.options[interaction.values[0]];
                    break;
                }

            }
            interaction.update(getOptions());
        });
    }
};