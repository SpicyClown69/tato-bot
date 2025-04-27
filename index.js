const { Client, GatewayIntentBits, EmbedBuilder, Collection, REST, Routes, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');

// if you want to change what triggers the autoresponder, add things to the "main_filter" object
// right now it triggers if you ping potatobot
const config = require("./config.json")

// if you dont have a token.json file, create one and just do [<your token>]
let token;
try {
    const tokenData = require("./token.json");
    token = tokenData.token;
    if (!Array.isArray(token) || !token[0]) {
        throw new Error("Token not properly formatted in token.json");
    }
} catch (error) {
    console.error("Error loading token.json:", error.message);
    console.error("Please make sure token.json exists and contains: { \"token\": [\"YOUR_BOT_TOKEN_HERE\"] }");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

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

// load and register commands into memory, because its better
if (commandsEnabled) {
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        console.log(file, command)
        commands.push(command.data.toJSON());
        commandFuncs[command.data.name] = (command.func)
    }
}

const rest = new REST({ version: '10' }).setToken(token[0]);

client.once('ready', () => {
    console.log('Bot is ready! Support system active.');
    
    // register slash commands when bot is ready and we have the client id
    (async () => {
        try {
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands },
            );
            console.log('Successfully registered application commands.');
        } catch (e) {
            console.error('Failed to register commands:', e);
        }
    })();

    // beep boop. update config with bot's own ID on startup
    try {
        const configPath = './config.json';
        const config = require(configPath);
        
        // this basically just adds the bots own ID to the main_filter array if its not already there
        const botMention = `<@${client.user.id}>`;
        if (!config.main_filter.includes(botMention)) {
            config.main_filter.push(botMention);
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            console.log("Updated config.json with bot's ID");
        }
    } catch (error) {
        console.error("Failed to update config with bot ID:", error);
    }

    sendError("start", "Bot initialized successfully", 0xF5005F)
});

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


// client.on("messageCreate", (message) => {
//     if (message.author.id !== "721640105307275315" && message.content.toLowerCase() === "linux") {return}
//     const linux = [
//         "https://cdn.discordapp.com/attachments/1156304119313748010/1360535401164570624/caption.gif?ex=680d4515&is=680bf395&hm=6f04b4ee59a0e103bc272d1799d42e5c4993a732932c39997a3ba9f9a991c3aa&",
//         "https://tenor.com/view/linux-trash-linuxbad-gif-18671901",
//         "https://tenor.com/view/linux-gif-25928231",
//         "https://tenor.com/view/sudo-rm-rf-linux-bruh-chungus-poggers-gif-19024993",
//         "https://tenor.com/view/sudo-rm-rf-sudo-rm-rf-beamng-gif-25571467",
//         "https://tenor.com/view/linux-linux-users-gif-24927537",
//         "https://tenor.com/view/arch-linux-linux-open-source-arch-i-use-arch-btw-gif-25315741",
//         "https://tenor.com/view/breaking-in-windows-linux-meme-breaking-into-a-windows-user-gif-27138745",
//         "https://tenor.com/view/arch-linux-linux-open-source-arch-i-use-arch-btw-gif-25315741",
//         "https://tenor.com/view/linux-linux-user-open-source-gif-26342988",
//         "https://tenor.com/view/linux-windows-11-window-door-computer-breaking-into-gif-2145998682255639382"
//         ]
//     message.reply(linux[Math.floor(Math.random() *linux.length)])
// })

// handle incoming messages
client.on('messageCreate', async message => {
    try {
        // ignore bot messages
        if (message.author.bot) return;

        // handle unblock command
        if (message.content.toLowerCase() === "!unblock") {
            const live_config = JSON.parse(fs.readFileSync("./config.json"))
            let blocklist = JSON.parse(fs.readFileSync("./blocklist.json"))
            if (blocklist.includes(message.author.id)) {
                blocklist.splice(blocklist.indexOf(message.author.id), 1)
                fs.writeFileSync("./blocklist.json", JSON.stringify(blocklist, null, 4))
                sendError("user removed from blocklist", message.author.id, 0x0000FF)
                const embed = new EmbedBuilder()
                    .setTitle("You have unblocked this bot")
                    .setColor(0x00FF00)
                    .setThumbnail(live_config.links.embed_image)
                message.reply({embeds:[embed], ephemeral: true})
                return
            }

            const embed = new EmbedBuilder()
                .setTitle("You have not blocked this bot")
                .setColor(0xFF0000)
                .setThumbnail(live_config.links.embed_image)
            message.reply({embeds:[embed], ephemeral: true})
            return
        }

        // check filter and handle support request
        const filterResult = filterCheck(message);
        if (filterResult) {
            const live_config = JSON.parse(fs.readFileSync("./config.json"))
            const blocklist = JSON.parse(fs.readFileSync("./blocklist.json"))
            if (blocklist.includes(message.author.id)) return;

            // rest of the existing message handling code
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

            const block = new ButtonBuilder()
                .setLabel("Block")
                .setCustomId("block")
                .setStyle("Danger")

            const issues = new ButtonBuilder()
                .setLabel("READ | KNOWN ISSUES")
                .setCustomId("issues")
                .setStyle("Primary")

            const row = new ActionRowBuilder()
                .addComponents(issues, wiki, modrinth, mac_not_working, tutorial)

            const row2 = new ActionRowBuilder()
                .addComponents(block)

            const row3 = new ActionRowBuilder()
                .addComponents(select)

            const embed = new EmbedBuilder()
                .setColor(0xFFCC00)
                .setThumbnail(live_config.links.embed_image)
                .setTitle("Frequently Asked Questions")
                .addFields(
                    { name:"What can I find here?", value:"You can find links to very important info below at all times.\nSelect your question below"}
                )
                .setFooter({text:"Click \"block\" if you dont want to see this anymore"})
            
            const response = await message.reply({
                embeds: [embed],
                components: [row, row2, row3],
                withResponse: true,
                flags: MessageFlags.Ephemeral
            });

            const collector = response.createMessageComponentCollector({time: 240_000});

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
                        i.update({embeds:[embed], flags: MessageFlags.Ephemeral})
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
                    i.update({embeds:[embed], flags: MessageFlags.Ephemeral})
                    return
                }

                if (i.customId === "issues") {
                    const embed = new EmbedBuilder()
                        .setTitle("Frequently Asked Questions")
                        .setColor(0xFFCC00)
                        .setThumbnail(live_config.links.embed_image)
                        .addFields(live_config.faq.important_note.fields)
                        .setFooter({text:"Click \"block\" if you dont want to see this anymore"})
                    i.update({embeds:[embed], components:[row,row2], flags: MessageFlags.Ephemeral})
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
                    i.update({embeds:[embed], components:[row,row2], flags: MessageFlags.Ephemeral})
                } catch (e) {
                    console.log(e)
                }
            });
        }
    } catch (error) {
        console.error('Error processing message:', error);
        message.reply('Sorry, I encountered an error while processing your request. Please try again later.');
    }
});

// a bunch of jank ass code to check if the message is a support request
function filterCheck(message) {
    const config = require('./config.json');
    const content = message.content.toLowerCase();
    
    if (message.mentions.has(client.user)) {
        console.log('Support request detected: Direct mention');
        return true;
    }

    const words = content.split(/\s+/).map(word => word.trim());
    
    // fuck yeah, better question detection that actually works YIPPIE
    const questionWords = ['how', 'what', 'where', 'why', 'when', 'can', 'does', 'is', 'are', 'will'];
    const isQuestion = content.includes('?') || questionWords.some(qWord => 
        words.some(word => word === qWord || word.startsWith(qWord))
    );

    if (!isQuestion) {
        return false;
    }

    // a bunch of shit to check if the message is a support request
    const supportPatterns = {
        install: ['\\binstall\\b', '\\bsetup\\b', '\\bdownload\\b', '\\bfabric\\b', '\\bmod\\b', '\\bdependencies\\b', '\\bgeckolib\\b', '\\bvoicechat\\b', '\\bessential\\b'],
        crash: ['\\bcrash\\b', '\\berror\\b', '\\bbug\\b', '\\bfreeze\\b', '\\bstuck\\b', 'not working', '\\bbroken\\b', 'integrated graphics', '\\bincompatible\\b'],
        gameplay: ['\\bskinwalker\\b', '\\bbackrooms\\b', '\\bnoclip\\b', '\\blevel\\b', '\\bflashlight\\b', '\\bexit\\b', '\\bsuffocate\\b', '\\benter\\b', '\\bpoolrooms\\b', 'grass field', '\\bmap\\b'],
        technical: ['\\bfps\\b', '\\bperformance\\b', '\\bgraphics\\b', '\\blag\\b', '\\bsettings\\b', '\\bshaders\\b', '\\bveil\\b', '\\bfabulous\\b', '\\bfancy\\b', '\\bfast\\b', '\\bopengl\\b'],
        compatibility: ['\\bmac\\b', '\\bmacos\\b', '\\bsodium\\b', '\\biris\\b', '\\bforge\\b', '\\bneoforge\\b', '\\bintegrated\\b', '\\baternos\\b', '\\bserver\\b', '\\bmultiplayer\\b']
    };

    // and we check each category for support patterns
    for (const [category, patterns] of Object.entries(supportPatterns)) {
        if (patterns.some(pattern => {
            const regex = new RegExp(pattern, 'i');
            return regex.test(content);
        })) {
            console.log(`Support request detected: ${category} category`);
            return true;
        }
    }

    // and we check if the message contains any of the main filter words
    const hasFilterWord = config.main_filter.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(content);
    });

    return hasFilterWord;
}

// handle support request with appropriate FAQ
function handleSupportRequest(message, category) {
    const config = require('./config.json');
    const faq = config.faqs[category];

    if (faq) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(faq.title)
            .setDescription(faq.description)
            .setFooter({ text: 'Need more help? Check our #support channel' });

        message.reply({ embeds: [embed] });
    } else {
        // fallback to general help message
        message.reply('How can I help you? For specific issues, try asking about:\n- Installation\n- Crashes\n- Gameplay\n- Technical issues\n- Multiplayer');
    }
}

client.on("error", (e) => {
    console.log(e)
    sendError("error",e,0xFF0000)
})

process.on("uncaughtException", (e) => {
    console.log(e)
    sendError("uncaught exception",e,0xFF0000)
})

async function sendError(code, e, color) {
    try {
        // only trying to send a Discord message if the client is actually fucking ready and logged in lol
        if (client.isReady()) {
            const owner = await client.users.fetch("552766239009931274")
            const embed = new EmbedBuilder()
                .setTitle(code)
                .setDescription(`${e}`)
                .setTimestamp()
                .setColor(color)
            owner.send({embeds:[embed]})
        } else {
            console.error(`[${code}] ${e}`)
        }
    } catch (err) {
        // there was really annoying errors that would just spam the console
        console.error(`Failed to send error message: ${err}`)
        console.error(`Original error: [${code}] ${e}`)
    }
}

// omg we validate the token here. i could've done it better but this works so i'm not gonna change it
if (!token || !token[0] || typeof token[0] !== 'string' || token[0].length < 50) {
    console.error("Invalid Discord token. Make sure token.json contains a valid bot token.")
    process.exit(1)
}

client.login(token[0])
    .catch(err => {
        console.error("Failed to login:", err)
        process.exit(1)
    })

process.on("beforeExit", () => {sendError("shutdown","mhm",0xF5335F)})
