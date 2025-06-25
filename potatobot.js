// righty ho time to declutter and move code that will be reused at future points
// also it would be advised that before new mods release that we should have time to add things to a "predicted" FAQ

//! When trying to access things like client.on or anything to do with client you MUST use bot.client
const bot = require("./index.js")

const {ButtonBuilder, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, REST, Routes, Collection} = require("discord.js")
const fs = require("node:fs")
const maintainers = require("./maintainers.json")

class potatobot {

    constructor (token,config) {
        this.token = token
        this.config = config
    }

    get fetchserver() {
        return bot.client.guilds.fetch("1251520688569974914")
    }

    /**
     * Sets PotatoBots nickname
     * @param {string} name 
     */
    async setName(name) {
        //const server = await (await (await bot.client.guilds.fetch("1251520688569974914")).members.fetch("1360807782001148134")).setNickname(name)
        (await (await bot.client.guilds.fetch("1251520688569974914")).members.fetch("1360807782001148134")).setNickname(name)
    }

    /**
     * Returns an object to create the select options
     * @returns object
     */
    createSelectOptions() {// TODO: Make this not hardcoded to allow for selecting which FAQ the user would like to read
        let buffer = []
        for (var i = 0; i < Object.keys(this.config.faq).length; i++) { // 4:20GMT istfg if i have to do the most jank ass solution to get this to work
            buffer.push({
                label:(this.config.faq[ Object.keys(this.config.faq) [i] ].fields[0].name),
                value:(Object.keys(this.config.faq)[i].toString()) 
            })
        }
        return buffer
    }

    /**
     * Loads the interactions into the bot
     * @param {String} token 
     */
    loadCommands() {
        bot.client.commands = new Collection()

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

        const rest = new REST({ version: '10' }).setToken(this.token[0]);

        try {
            rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );
        } catch (e) {
            console.error(e)
        }

        // Create the slash commands
        bot.client.on('interactionCreate', async interaction => {
            if (!interaction.isChatInputCommand()) return;
            commandFuncs[interaction.commandName](interaction)
        });
    }


    // i know its just moving this to a function
    // but baby-steps. Im eventually going to have to figure out a more cusomisable way
    // * Basically my idea is to create a class for this, and what happens is that the embed gets made in the "main" function
    // * and you can modify the data of that function using other ones, like appending buttons or info
    // * i guess an easy way is to think of it like a conveyor belt or production line. The robots (functions) assemble the product (embed) and then you call a function to actually send the completed data
    // * probably a pretty stupid way to do it but if it works then it works
    /**
     * Sends the FAQ to the Found Footage mod
     */
    async backroomsfaq(msg) {
        const live_config = JSON.parse(fs.readFileSync("./config.json"))
        const select = new StringSelectMenuBuilder()
            .setCustomId('faq')
            .setPlaceholder('Select a Question')
            //.setOptions(selectOptions.map(question => { return { label:question.label.toString(), value:question.value.toString()}}))
            .setOptions(this.createSelectOptions())
        
        const wiki = new ButtonBuilder()
            .setLabel("Backrooms Wiki")
            .setURL(this.config.links.wiki)
            .setStyle("Link")

        const mac_not_working = new ButtonBuilder()
            .setLabel("Use Mac?")
            .setURL(this.config.links.wiki_mac)
            .setStyle("Link")

        const tutorial = new ButtonBuilder()
            .setLabel("Video Tutorial")
            .setURL(this.config.links.wiki_install)
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
                pb.sendError("user added to blocklist",i.user.id,0x0000FF)
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
        })
    }
    
    /**
     * Detects when a member joins and sends a welcome message
     */
    welcomer() {
        bot.client.on('guildMemberAdd', async (member) => {
            if(member.bot) return;
        
            console.log(member.displayName + " joined the server!");
            const server = member.guild;
            const welcomeChannel = server.systemChannel;
            const rulesChannel = server.rulesChannel;
            
            let newUserCount = server.memberCount.toString();
            let countString = "";
            
            switch (newUserCount.charAt(newUserCount.length - 1)) {
                case '1':
                    countString = "st";
                    break;
                case '2':
                    countString = "nd";
                    break;
                case '3':
                    countString = "rd";
                    break;
                default:
                    countString = "th";
                    break;
            }
        
            newUserCount = newUserCount + countString;
        
            const embed = new EmbedBuilder()
                .setColor(0xFFCC00)
                .setTitle("Welcome " + member.displayName + " to the Space Fries Discord!")
                .setThumbnail(member.user.avatarURL())
                .addFields(
                    { name:"Make sure to check out the " + rulesChannel.url + " first", value: "You are the " + newUserCount + " member to join the server"}
                )
        
            welcomeChannel.send({
                content: "<@" + member.user.id + ">",
                embeds: [embed]
            });
        })
    }

    /**
     * Checks if a message contains ANY phrase in config.main_filter
     * @param {Message} message 
     * @returns boolean
     */
    filterCheck(message) {
        const live_config = JSON.parse(fs.readFileSync("./config.json"))
        for (var i = 0; i < live_config.main_filter.length; i++) {
            if (message.content.toLowerCase().includes(live_config.main_filter[i])) {
                console.log(`${message.author.username} said ${live_config.main_filter[i]}`)
                return true
            }
        }
        return false
    }

    /**
     * Returns SpacePotato's subscriber count and assigns to specified channel
     * @param {string} token 
     */
    async getSubscriberCount(token) {
        const server = await bot.client.guilds.fetch("1251520688569974914");
        const channel = await server.channels.fetch("1382364642499887195");

        const result = await fetch('https://www.googleapis.com/youtube/v3/channels?key='+token[1]+'&part=statistics&forHandle=SpacePotatoee');
        const text = await result.json();

        // ! TypeError: Cannot read properties of undefined (reading '0')
        // * Space, you made this so you might have  better understanding on this but are you able to try and fix this, i have no clue
        let subCount = text['items'][0]['statistics']['subscriberCount'];
        let slicedCount = subCount.slice(0, -2);
        finalCount = slicedCount.slice(0, -1) + '.' + slicedCount.slice(-1) + 'K';
        
        await channel.setName('🎉︱Subscribers: ' + finalCount);
        
        console.log("Updated the sub count to " + finalCount);
    }

    /**
     * Sets a random status for potatobot.
     */
    setRandomStatus() {
        bot.client.user.setActivity("Ping for FAQ | "+this.config.status[Math.floor(Math.random()*this.config.status.length)])
    }

    async sendError(code, error, color) {
    for(let i = 0; i < maintainers.length; i++){
        const maintainer = await bot.client.users.fetch(maintainers[i])

        const embed = new EmbedBuilder()
            .setTitle(code)
            .setDescription(`${error}`)
            .setTimestamp()
            .setColor(color)
        
        maintainer.send({embeds:[embed]})
    }
}
}

module.exports.potatobot = potatobot
