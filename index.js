const {
    Client,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    GatewayIntentBits,
    ButtonBuilder,
    ActionRowBuilder, 
    ButtonStyle,
    REST,
    Routes,
    Collection,
} = require("discord.js")

const fs = require("fs")

// if you want to change what triggers the autoresponder, add things to the "main_filter" object
// right now it triggers if you ping potatobot
const config = require("./config.json")

// if you dont have a token.json file, create one and just do [<your token>]
const token = process.env.DISCORD_TOKEN


const client = new Client({intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
]})

function createSelectOptions() {
    let buffer = []
    for (var i = 0; i < Object.keys(config.faq).length; i++) { // 4:20GMT istfg if i have to do the most jank ass solution to get this to work
        buffer.push({
            label:(config.faq[ Object.keys(config.faq) [i] ].fields[0].name),
            value:(Object.keys(config.faq)[i].toString()) 
        })
    }
    return buffer
}
const selectOptions = createSelectOptions()


//---------------------------------------------------------------------------
// command loader

client.commands = new Collection()

const commands = [];
const commandFuncs = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js') && file !== "template.js"); // ignore the template command
const commandsEnabled = true;
// bot client id needed here
const clientId = "1364999662280638616"

// load commands into discord
if (commandsEnabled) {

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        console.log(file, command)
        commands.push(command.data.toJSON());
        commandFuncs[command.data.name] = (command.func)
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
    } catch (e) {
        console.error(e)
    }
})()

// Create the slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    commandFuncs[interaction.commandName](interaction)
});

// actual code


const select = new StringSelectMenuBuilder()
    .setCustomId('faq')
    .setPlaceholder('Select a Question')
    //.setOptions(selectOptions.map(question => { return { label:question.label.toString(), value:question.value.toString()}}))
    .setOptions(selectOptions)

client.on("messageCreate", async (msg) => {
    if (msg.content.toLowerCase() === "!unblock") {
        const live_config = JSON.parse(fs.readFileSync("./config.json"))
        let blocklist = JSON.parse(fs.readFileSync("./blocklist.json"))
        if (blocklist.includes(msg.author.id)) {

            blocklist.splice(blocklist.indexOf(msg.author.id),1)
            fs.writeFileSync("./blocklist.json", JSON.stringify(blocklist, null, 4))
            sendError("user removed to blocklist",msg.author.id,0x0000FF)
            const embed = new EmbedBuilder()
            .setTitle("You have unblocked this bot")
            .setColor(0x00FF00)
            .setThumbnail(live_config.links.embed_image)
            msg.reply({embeds:[embed], ephemeral: true})
    
            return
        }

        const embed = new EmbedBuilder()
            .setTitle("You have not blocked this bot")
            .setColor(0xFF0000)
            .setThumbnail(live_config.links.embed_image)
            interaction.reply({embeds:[embed], ephemeral: true})
    }
    if (filterCheck(msg) === false) {return}
    const live_config = JSON.parse(fs.readFileSync("./config.json"))
    const blocklist = JSON.parse(fs.readFileSync("./blocklist.json")) // just so you dont have to restart the bot every time someone blocks it
    if (blocklist.includes(msg.author.id)) {return}
    const filter = (m) => m.member.id === msg.member.id

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

    const block = new ButtonBuilder()
        .setLabel("Block")
        .setCustomId("block")
        .setStyle("Danger")

    const issues = new ButtonBuilder()
        .setLabel("READ | KNOWN ISSUES")
        .setCustomId("issues")
        .setStyle("Primary")

    const row = new ActionRowBuilder()
        .addComponents(issues, wiki, mac_not_working, tutorial, block)

    const row2 = new ActionRowBuilder()
        .addComponents(select)

    const embed = new EmbedBuilder()
        .setColor(0xFFCC00)
        .setThumbnail(live_config.links.embed_image)
        .setTitle("Frequently Asked Questions")
        .addFields(
            { name:"What can I find here?", value:"You can find links to very important info below at all times.\nSelect your question below"}
        )
        .setFooter({text:"Click \"block\" if you dont want to see this anymore"})
    const response = await msg.reply({
        embeds: [embed] ,
        components: [row,row2],
        withResponse: true,
        ephemeral: true
    });

    const collector = response.createMessageComponentCollector({ filter: filter, time: 240_000});

    collector.on('collect', async (i) => {
        const live_config = JSON.parse(fs.readFileSync("./config.json"))
        if (i.customId === "block") {
            let blocklist = JSON.parse(fs.readFileSync("./blocklist.json"))
            if (blocklist.includes(i.user.id)) {
 
                const embed = new EmbedBuilder()
                .setTitle("You have already blocked this bot")
                .setColor(0xFF0000)
                .setThumbnail(live_config.links.embed_image)
                .setFooter({text:"You can still use /help | You can unblock yourself using !unblock"})
                i.update({embeds:[embed], ephemeral: true})
                return
            }
            blocklist.push(i.user.id)
            fs.writeFileSync("./blocklist.json", JSON.stringify(blocklist, null, 4))
            sendError("user added to blocklist",i.user.id,0x0000FF)
            const embed = new EmbedBuilder()
                .setTitle("Added to block-list")
                .setColor(0xFF0000)
                .setThumbnail(live_config.links.embed_image)
                .setDescription("What does this mean? It means that if you say something in my filter; I wont reply to you.")
                .setFooter({text:"You can still use /help | You can unblock yourself using !unblock"})
                i.update({embeds:[embed], ephemeral: true})

            return
        }

        if (i.customId === "issues") {
            const embed = new EmbedBuilder()
                .setTitle("Frequently Asked Questions")
                .setColor(0xFFCC00)
                .setThumbnail(live_config.links.embed_image)
                .addFields(live_config.faq.important_note.fields)
                .setFooter({text:"Click \"block\" if you dont want to see this anymore"})
            i.update({embeds:[embed], components:[row,row2], ephemeral: true})
            return
        }


        const selection = i.values[0];
        try {
            const embed = new EmbedBuilder()
                .setTitle("Frequently Asked Questions")
                .setColor(0xFFCC00)
                .setThumbnail(live_config.links.embed_image)
                .addFields(live_config.faq[selection].fields)
                .setFooter({text:"Click \"block\" if you dont want to see this anymore"})
            i.update({embeds:[embed], components:[row,row2], ephemeral: true})
        } catch (e) {
            console.log(e)
        }
    });
})

function filterCheck(message) {
    const live_config = JSON.parse(fs.readFileSync("./config.json"))
    for (var i = 0; i < live_config.main_filter.length; i++) {
        if (message.content.toLowerCase().includes(live_config.main_filter[i])) {
            console.log(live_config.main_filter[i])
            return true
        }
    }
    return false
}


client.on("error", (e) => {
    console.log(e)
    sendError("error",e,0xFF0000)
})

process.on("uncaughtException", (e) => {
    console.log(e)
    sendError("uncaught exception",e,0xFF0000)
})

async function sendError(code,e,color) {
    const owner = await client.users.fetch("520961867368103936")
    const embed = new EmbedBuilder()
        .setTitle(code)
        .setDescription(`${e}`)
        .setTimestamp()
        .setColor(color)
    owner.send({embeds:[embed]})
}

client.login(token)
client.on("ready", () => { console.log("started"); sendError("start","mhm",0xF5005F)})
