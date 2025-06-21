const {
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    FileBuilder,
    MessageFlags,
    SectionBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder
} = require('discord.js');

const fs = require("node:fs")



function createSelectOptions(mod) {
    const config = JSON.parse(fs.readFileSync("./wiki.json"))
    let buffer = []
    for (var i = 0; i < Object.keys(config.faq).length; i++) { // 4:20GMT istfg if i have to do the most jank ass solution to get this to work
        buffer.push({
            label:(config.mod[ Object.keys(config.faq) [i] ].pages[0].name),
            value:(Object.keys(config.faq)[i].toString()) 
        })
    }
    return buffer
}

class componentSender {
    constructor() {

    }
    
    linkCreator() {
        const container = new ContainerBuilder()
        const header = new TextDisplayBuilder().setContent(
            [
                "# Important links",
                "> **Found Footage is NOT compatible with integrated graphics. If you get a loading screen with boxes for fonts, you have integrated",
                "> **Found Footage is also NOT compatible with MacOS\n",
                "## QUILT, SODIUM, INDIUM, OPTIFINE, OPTIFABRIC AND IRIS ARE INCOMPATIBLE"
            ].join("\n")
        )
        container.addTextDisplayComponents(header).setAccentColor(0x552255)
        container.addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small));
        const wikilinks = new TextDisplayBuilder().setContent(
            [
                "### Wiki Links",
                "[Mod Info](https://github.com/SpacePotatoee/SPBackrooms-Revamped/wiki/Mod-Info)",
                "[Wiki](https://github.com/SpacePotatoee/MinecraftFoundFootage/wiki)",
                "[General Mechanics](https://github.com/SpacePotatoee/MinecraftFoundFootage/wiki#general-mechanics)",
                "[Multiplayer](https://github.com/SpacePotatoee/MinecraftFoundFootage/wiki#general-mechanics)",
                "[Levels and how to progress](https://github.com/SpacePotatoee/MinecraftFoundFootage/wiki/Levels#levels-overview)",
                "[Debug Commands](https://github.com/SpacePotatoee/MinecraftFoundFootage/wiki/Commands#debug-commands)",
                "[Dependencies](https://github.com/SpacePotatoee/MinecraftFoundFootage/wiki/Mod-Info#dependencies)",
                "[Incompatibilities](https://github.com/SpacePotatoee/MinecraftFoundFootage/wiki/Mod-Info#incompatibilities)",
                "^^^^ Common issues we have are people downloading: A) FORGE versions | B) Wrong MINECRAFT versions | C) Modpacks"
            ].join("\n")
        )
        container.addTextDisplayComponents(wikilinks)
        container.addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small));
        const otherlinks = new TextDisplayBuilder().setContent(
            [
                "### Other Links",
                "[github repo](https://github.com/SpacePotatoee/MinecraftFoundFootage)",
                "[Bug Reports](https://github.com/SpacePotatoee/MinecraftFoundFootage/issues)",
                "-# please follow the formatting when making a \"Bug Report\" issue, it makes debugging so much easier"
            ].join("\n")
        )
        container.addTextDisplayComponents(otherlinks)
        return container
    }

    wikiCreatorHome() {
        const container = new ContainerBuilder()
        const header = new TextDisplayBuilder().setContent(
            [
                "# Wiki 0.0.0",
                "Welcome to PotatoBot's built in wiki! To get started, please select what mods wiki you would like to see below",
                "### Currently Available Wiki Pages"
            ].join("\n")
        )
        container.addTextDisplayComponents(header).setAccentColor(0xFF22FF)
        container.addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small));
        const availablePages = new TextDisplayBuilder().setContent(
            [
                "- Backrooms Wiki"
            ].join("\n")
        )
        container.addTextDisplayComponents(availablePages)

        container.addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small));
        const selectArea = new TextDisplayBuilder().setContent(
            [
                "### Please select a mod below!"
            ].join("\n")
        )
        const config = JSON.parse(fs.readFileSync("./wiki.json"))
        let buffer = []
        for (var i = 0; i < Object.keys(config).length; i++) { // 4:20GMT istfg if i have to do the most jank ass solution to get this to work
            buffer.push({
                label:(config[ Object.keys(config)[i] ].select_name),
                value:(config[ Object.keys(config)[i] ].select_name) 
            })
        }
        const selector = new StringSelectMenuBuilder()
            .setCustomId('mod')
            .setPlaceholder('Select a mod')
            .setOptions(buffer)
        container.addTextDisplayComponents(selectArea)
        container.addActionRowComponents(row => row.addComponents(selector));
        return container
    }

    modSelector(mod) {
        const wiki = JSON.parse(fs.readFileSync("./wiki.json"))
        const container = new ContainerBuilder()
        const header = new TextDisplayBuilder().setContent(
            [
                wiki.mod.select_name,
                wiki.mod.description.join("\n")
            ].join("\n")
        )
        container.addTextDisplayComponents(header)
        container.addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small));
        const selectArea = new TextDisplayBuilder().setContent(
            [
                "### Please select a page below!"
            ].join("\n")
        )

        const selector = new StringSelectMenuBuilder()
            .setCustomId('wiki')
            .setPlaceholder('Select a page')
            .setOptions(createSelectOptions())
        container.addTextDisplayComponents(selectArea)
        container.addActionRowComponents(row => row.addComponents(selector));
        return container
    }

    wikiCreator(page) {
        
    }
}

module.exports = {
    componentSender
}