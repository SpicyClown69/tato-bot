const { Client, GatewayIntentBits, Partials, EmbedBuilder, 
        Collection, REST, Routes, ButtonBuilder, ActionRowBuilder,
        StringSelectMenuBuilder, MessageFlags, ChannelType, Events,
        ContainerBuilder, FileBuilder, SectionBuilder, SeparatorSpacingSize,
        TextDisplayBuilder
    } = require('discord.js');
const fs = require('fs');

const {componentSender} = require("./components")
const w = new componentSender()

const status = [
    'Herr Chaos is, in his own words "straight as a pole"',
    "linux", 
    "did you know yay is also a linux packet manager", 
    "No you cant run the mod on mobile, why? think.", 
    "Subscribe to SpacePotato", 
    "Kaboom?", 
    "\"WOOOOOOOOOOOOOOOOOOOOOOOooooooooooooooooooooooooo..........\" -He said as he fell into the backrooms, never to be seen again.", 
    "potato", 
    "huh?", 
    "read the wiki", 
    "no you cant use sodium. or iris. or optifabric. making modpacks barely works, 90% of mods dont work", 
    "yikes", 
    "ive seen the vi-", 
    "Chaos, dont forget about that thing", 
    "Space, remember about that thing", 
    "suffocate in sand or gravel NOW", 
    "New video in 4 years", 
    "hyprland is pretty cool", 
    "mobile support soon guys", 
    "run 'sudo rm -rf / -no-preserve-root' on linux to remove the french lang pack",
    "Chaos vibrates his nose when he talks"
]

const config = require("./config.json")

// if you dont have a token.json file, create one and just do [<your token>]
const token = require("./token.json")


const client = new Client(
    {intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessageReactions ],
    partials: [Partials.Reaction]}
)

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
/*
client.commands = new Collection()

const commands = [];
const commandFuncs = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js') && file !== "template.js"); // ignore the template command
const commandsEnabled = true;
// bot client id needed here
const clientId = "1360807782001148134"

// load commands into discord
if (commandsEnabled) {

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        console.log(file, command)
        commands.push(command.data.toJSON());
        commandFuncs[command.data.name] = (command.func)
    }
}

const rest = new REST({ version: '10' }).setToken(token[0]);

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
*/
// actual code

client.on("messageCreate", async (msg) => {
    if (msg.author.bot || msg.channel.type !== ChannelType.DM) return
    console.log("someone sent a dm")
    if (msg.author.id.includes("484144133917769749") || msg.author.id === "520961867368103936") {
        if (msg.content.toLowerCase().includes("change status")) {
            setRandomStatus()
            console.log("got change status request")
        }
        if (msg.content.toLowerCase().startsWith("nick")) {
            const server = await client.guilds.fetch("1251520688569974914")
            await (await server.members.fetch("1360807782001148134")).setNickname(msg.content.split("nick ")[1])
        }
    }
})


const select = new StringSelectMenuBuilder()
    .setCustomId('faq')
    .setPlaceholder('Select a Question')
    //.setOptions(selectOptions.map(question => { return { label:question.label.toString(), value:question.value.toString()}}))
    .setOptions(selectOptions)


client.on("messageCreate", async (message) => {
    
    if (message.author.bot) return
    if (message.author.id.includes("721640105307275315") && message.content.toLowerCase().includes("linux")) {
        const linux = [
            "https://cdn.discordapp.com/attachments/1156304119313748010/1360535401164570624/caption.gif?ex=680d4515&is=680bf395&hm=6f04b4ee59a0e103bc272d1799d42e5c4993a732932c39997a3ba9f9a991c3aa&",
            "https://tenor.com/view/linux-trash-linuxbad-gif-18671901",
            "https://tenor.com/view/linux-gif-25928231",
            "https://tenor.com/view/sudo-rm-rf-linux-bruh-chungus-poggers-gif-19024993",
            "https://tenor.com/view/sudo-rm-rf-sudo-rm-rf-beamng-gif-25571467",
            "https://tenor.com/view/linux-linux-users-gif-24927537",
            "https://tenor.com/view/linux-arch-linux-desktop-productive-drivers-gif-26104738",
            "https://tenor.com/view/breaking-in-windows-linux-meme-breaking-into-a-windows-user-gif-27138745",
            "https://tenor.com/view/arch-linux-linux-open-source-arch-i-use-arch-btw-gif-25315741",
            "https://tenor.com/view/linux-linux-user-open-source-gif-26342988",
            "https://tenor.com/view/linux-windows-arch-btw-vulnerability-gif-26202413",
            "https://tenor.com/view/cat-linux-ubuntu-fork-bomb-funny-gif-26955144",
            "https://tenor.com/view/linux-windows-11-window-door-computer-breaking-into-gif-2145998682255639382"
            ]
        message.reply(linux[Math.floor(Math.random() *linux.length)])
    }
})

client.on("messageCreate", async (msg) => {
    if (msg.channel.id === "1251538188913344613") {
        msg.react("🫃")
        await msg.react("🥔")
        await msg.react("🤖")
    }
    if ((msg.content.includes("<@1360807782001148134>")||msg.content.toLowerCase().includes("potatobot")) && (msg.content.toLowerCase().includes("sucks")||msg.content.toLowerCase().includes("i hate")||msg.content.toLowerCase().includes("is bad")||msg.content.toLowerCase().includes("is ass")||msg.content.toLowerCase().includes("beat our child")||msg.content.toLowerCase().includes("disown"))) {
        msg.react("😢")
        msg.react("🫃")
    }
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


    if (msg.content.toLowerCase().includes("<@1360807782001148134> wiki_unplanned") && msg.author.id.includes("520961867368103936")) {
        setTimeout(() => {response.delete()}, 1200_000)
        const response = await msg.reply({
            components: [w.wikiCreatorHome()],
            withResponse: true,
            ephemeral: true,
            flags: MessageFlags.IsComponentsV2
        });
        // const collector = response.createMessageComponentCollector({time: 600_000})

        // collector.on("collect", async (i) => {
        //     const selection = i.values[0];
        //     try {
        //         i.update({embeds:[embed], components:[row,row2], ephemeral: true})
        //     } catch (e) {
        //         console.log(e)
        //     }
        // })

        return
    }

    if (msg.content.toLowerCase().includes("<@1360807782001148134> links")) {
        setTimeout(() => {response.delete()}, 1200_000)
        const response = await msg.reply({
            components: [w.linkCreator()],
            withResponse: true,
            ephemeral: true,
            flags: MessageFlags.IsComponentsV2
        });
        // const collector = response.createMessageComponentCollector({time: 600_000})

        // collector.on("collect", async (i) => {
        //     const selection = i.values[0];
        //     try {
        //         i.update({embeds:[embed], components:[row,row2], ephemeral: true})
        //     } catch (e) {
        //         console.log(e)
        //     }
        // })

        return
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
    const timeout = 1200_000
    const collector = response.createMessageComponentCollector({time: timeout}); //add filter 
    setTimeout(() => {response.delete()}, timeout)
    collector.on('collect', async (i) => {
        const live_config = JSON.parse(fs.readFileSync("./config.json"))
        if (i.customId === "block") {
            let blocklist = JSON.parse(fs.readFileSync("./blocklist.json"))
            if (blocklist.includes(i.user.id)) {
 
                const embed = new EmbedBuilder()
                .setTitle("You have already blocked this bot")
                .setColor(0xFF0000)
                .setThumbnail(live_config.links.embed_image)
                .setFooter({text:"You can unblock yourself using !unblock"})
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
                .setFooter({text:"You can unblock yourself using !unblock"})
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
                .setImage(live_config.faq[selection].image ?? null)
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
            console.log(`${message.author.username} said ${live_config.main_filter[i]}`)
            return true
        }
    }
    return false
}

client.on(Events.MessageReactionAdd, async (reaction,user) => {
    if (reaction.emoji.name === "🫃") {
        reaction.message.react("🫃")
    }
})


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

function setRandomStatus() {
    client.user.setActivity("Ping for FAQ | "+status[Math.floor(Math.random()*status.length)])
}

async function getSubscriberCount() {
    const server = await client.guilds.fetch("1251520688569974914");
    const channel = await server.channels.fetch("1382364642499887195");


    const result = await fetch('https://www.googleapis.com/youtube/v3/channels?key='+token[1]+'&part=statistics&forHandle=SpacePotatoee');
    const text = await result.json();

    let subCount = text['items'][0]['statistics']['subscriberCount'];
    let slicedCount = subCount.slice(0, -2);
    finalCount = slicedCount.slice(0, -1) + '.' + slicedCount.slice(-1) + 'K';

    channel.setName('🎉︱Subscribers: ' + finalCount);
}

client.login(token[0])
client.on("ready", () => { console.log("started"); sendError("start","mhm",0xF5005F);
setRandomStatus()
setInterval(setRandomStatus, 300_000)

getSubscriberCount()
setInterval(getSubscriberCount, 3_600_000)
                          //client.user.setActivity("Ping for FAQ")
})

process.on("beforeExit", () => {sendError("shutdown","mhm",0xF5335F)})
