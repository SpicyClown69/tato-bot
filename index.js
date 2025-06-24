const config = require("./config.json")
const { 
    Client,       GatewayIntentBits,        Partials,      EmbedBuilder, 
    Collection,    REST,  Routes,    ButtonBuilder,    ActionRowBuilder,
    StringSelectMenuBuilder,    MessageFlags,     ChannelType,   Events,
    ContainerBuilder, FileBuilder, SectionBuilder, SeparatorSpacingSize,
    TextDisplayBuilder
    } = require('discord.js');
const fs = require('fs');
// if you dont have a token.json file, create one and just do [<your token>]
const token = require("./token.json")

//Who to send error reports to
const maintainers = require("./maintainers.json")

const {potatobot} = require("./potatobot"); const pb = new potatobot(token,config)

const client = new Client(
    {intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.DirectMessages, 
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Reaction]}
)
module.exports.client = client

pb.loadCommands(token[0])

//Welcome
pb.welcomer()

//#region Message Detection
client.on("messageCreate", async (msg) => {
    if (msg.author.bot || msg.channel.type !== ChannelType.DM) return
    console.log("someone sent a dm")
    if (msg.author.id.includes("484144133917769749") || msg.author.id.includes("520961867368103936")) {
        if (msg.content.toLowerCase().includes("change status")) {
            pb.setRandomStatus()
        }
        if (msg.content.toLowerCase().startsWith("nick")) {
            pb.setName(msg.content.split("nick ")[1])
        }
    }
})

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
    if ((msg.content.includes("<@1360807782001148134>")||msg.content.toLowerCase().includes("potatobot")) && (msg.content.toLowerCase().includes("sucks")||msg.content.toLowerCase().includes("i hate")||msg.content.toLowerCase().includes("is bad")||msg.content.toLowerCase().includes("is ass")||msg.content.toLowerCase().includes("beat our child")||msg.content.toLowerCase().includes("disown"))) {
        msg.react("😢")
        msg.react("🫃")
    }
    // TODO: Remove all of this or make it a compact function
    if (msg.content.toLowerCase() === "!unblock") {
        const live_config = JSON.parse(fs.readFileSync("./config.json"))
        let blocklist = JSON.parse(fs.readFileSync("./blocklist.json"))
        if (blocklist.includes(msg.author.id)) {

            blocklist.splice(blocklist.indexOf(msg.author.id),1)
            fs.writeFileSync("./blocklist.json", JSON.stringify(blocklist, null, 4))
            sendError("User removed from blocklist",msg.author.id,0x0000FF)
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
            msg.reply({embeds:[embed], ephemeral: true})
    }



    if (pb.filterCheck(msg) === false) {return}

    const blocklist = JSON.parse(fs.readFileSync("./blocklist.json")) // just so you dont have to restart the bot every time someone blocks it
    if (blocklist.includes(msg.author.id)) {return}
    const filter = (m) => m.member.id === msg.member.id
    // ! importing the needed functions through args purely because i dont want to re-import discord.js for "functions.js" and end up with a gigawall of words
    pb.backroomsfaq(msg)
});


client.on(Events.MessageReactionAdd, async (reaction,user) => {
    if (reaction.emoji.name === "🫃") {
        reaction.message.react("🫃")
    }
})
//#endregion Message Detection

//#region Error Logging
client.on("error", (e) => {
    console.log(e)
    pb.sendError("error",e,0xFF0000)
})
process.on("uncaughtException", (e) => {
    console.log(e)
    pb.sendError("uncaught exception",e,0xFF0000)
})
//#endregion Error Logging

async function getSubscriberCount() {
    const server = await client.guilds.fetch("1251520688569974914");
    const channel = await server.channels.fetch("1382364642499887195");


    const result = await fetch('https://www.googleapis.com/youtube/v3/channels?key='+token[1]+'&part=statistics&forHandle=SpacePotatoee');
    const text = await result.json();

    let subCount = text['items'][0]['statistics']['subscriberCount'];
    let slicedCount = subCount.slice(0, -2);
    finalCount = slicedCount.slice(0, -1) + '.' + slicedCount.slice(-1) + 'K';
    
    await channel.setName('🎉︱Subscribers: ' + finalCount);
    
    console.log("Updated the sub count to " + finalCount);
}

client.login(token[0])
client.on("ready", async () => {
    console.log("started");
    pb.sendError("Started PotatoBot","mhm",0x00FF00);

    //! this works normally but errors when being a timed thingymajig im too tired for this
    pb.setRandomStatus()
    // setInterval(pb.setRandomStatus, 300_000) // Set a random status every 5 minutes

    getSubscriberCount()
    setInterval(getSubscriberCount, 3_600_000)  // Update the subscriber counter every hour
})

module.exports.client = client