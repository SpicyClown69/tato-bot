// righty ho time to declutter and move code that will be reused at future points
// also it would be advised that before new mods release that we should have time to add things to a "predicted" FAQ

//! When trying to access things like client.on or anything to do with client you MUST use bot.client
const bot = require("./index.js")

const {ButtonBuilder, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, REST, Routes, Collection} = require("discord.js")
const fs = require("node:fs")
const maintainers = require("./maintainers.json")

let active_layer = ""

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
    createSelectOptions(layer) {
        console.log(Object.getPrototypeOf(this.getFaqLayer(layer)))
        let buffer = []
        const faq_layer = this.getFaqLayer(layer)
        for (var i = 0; i < Object.keys(faq_layer).length; i++) { // 4:20GMT istfg if i have to do the most jank ass solution to get this to work
            buffer.push({
                label:(faq_layer[ Object.keys(faq_layer) [i] ].fields[0].name),
                value:(Object.keys(faq_layer)[i].toString()) 
            })
        }

        return buffer
    }
    

    /**
     * Pass the name of the mod that is in the FAQ and then return its path
     * @param {string} layer 
     * @returns string - JSON PATH
     */
    getFaqLayer(layer) {
        if (Object.keys((this.liveConfig()).faq).includes(layer)) {
            active_layer = layer
        }

        if (layer === undefined) {
            active_layer = ""
            return (this.liveConfig()).faq
        } else {
            return eval("this.config.faq."+active_layer+".questions")
        }
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

    createSelectMenu(layer) {
        return (new StringSelectMenuBuilder()
            .setCustomId('faq')
            .setPlaceholder('Select a Question')
            .setOptions(this.createSelectOptions(layer)))
    }
    
    /**
     * Creates a button with the selected parameters. When creating a link button pass "customId" as null and when not then ignore the url arg
     * @param {string} label 
     * @param {string} style 
     * @param {string} customId 
     * @param {string} URL 
     * @returns Button
     */
    createButton(label, style, customId, URL) {
        if (style === "Link") {
            return (
                new ButtonBuilder()
                    .setLabel(label)
                    .setURL(URL)
                    .setStyle(style)
            )
        }
        return (
            new ButtonBuilder()
                .setLabel(label)
                .setCustomId(customId)
                .setStyle(style)
        )
    }


    /**
     * Use this to create a hotloading config instance
     * @returns JSON - Live Updating Config File
     */
    liveConfig() {
        return JSON.parse(fs.readFileSync("./config.json"))
    }

    /**
    * Creates the buttons for the corresponding mod FAQ
    * @param {string} layer 
    */
    createActionRow(layer) {
        const another_row = new ActionRowBuilder()
            .addComponents(this.createButton("Back to Home", "Secondary", "home"))
        const selector_last_element = new ActionRowBuilder()
            .addComponents(this.createSelectMenu(layer))
        const block = new ButtonBuilder()
            .setLabel("Block")
            .setCustomId("block")
            .setStyle("Danger")
        switch (active_layer) {
            default:
                return [another_row, selector_last_element]
            case "found_footage":
                const row = new ActionRowBuilder()
                    .addComponents(
                        //this.createButton("KNOWN ISSUES", "Primary", "issues"), 
                        this.createButton("Backrooms Wiki", "Link", null, this.config.links.wiki),
                        this.createButton("Use Mac?", "Link", null, this.config.links.wiki_mac),
                        this.createButton("Video Tutorial", "Link", null, this.config.links.wiki_install),
                        //block
                    )
                return [row, another_row, selector_last_element]

            case "some_mod":
                return [another_row, selector_last_element]
        }

        // const row = new ActionRowBuilder()
        //     .addComponents(issues, wiki, mac_not_working, tutorial, block)

        // const row2 = new ActionRowBuilder()
        //     .addComponents(this.createSelectMenu(layer))
        
    }

    /**
     * Sends the FAQ to the Found Footage mod
     * @param {Message} Input the message class
     */
    async faq(msg) {
        const live_config = JSON.parse(fs.readFileSync("./config.json"))
        
        const embed = new EmbedBuilder()
            .setColor(0xFFCC00)
            .setThumbnail(live_config.links.embed_image)
            .setTitle("Frequently Asked Questions")
            .addFields(
                { name:"What can I find here?", value:"You can find links to very important info below at all times.\nPlease select the desired mod below. Go back to this page by clicking \"Back to Home\""}
            )
        const response = await msg.reply({
            embeds: [embed] ,
            components: this.createActionRow(),
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

            if (i.customId === "home") {
                i.update({
                    embeds: [embed] ,
                    components: this.createActionRow(),
                    withResponse: true,
                    ephemeral: true
                })
            }

            if (i.customId === "faq") {
                const selection = i.values[0];
                console.log(selection)
                try {

                    const row = this.createActionRow(selection)
                    console.log(active_layer)
                    console.log(selection)
                    let field_path = ".fields"
                    let image_path = ".image"
                    if ((active_layer !== "") && selection !== active_layer) {
                        field_path = ".questions."+selection+".fields"
                        image_path = ".questions."+selection+".image"
                    }
                    console.log([field_path, image_path])
                    //console.log(Object.keys(eval("live_config.faq."+selection+".questions.fields")))
                    const embed = new EmbedBuilder()
                        .setTitle("Frequently Asked Questions")
                        .setColor(0xFFCC00)
                        .setThumbnail(live_config.links.embed_image)
                        .addFields(eval("live_config.faq."+active_layer+field_path))
                        .setFooter({text:"Click \"block\" if you dont want to see this anymore"})
                        .setImage(eval("live_config.faq."+active_layer+image_path) ?? null)
                    i.update({embeds:[embed], components:row, ephemeral: true})
                } catch (e) {
                    console.log(e)
                }
            }
        })
    }
    
    /**
     * Detects when a member joins and sends a welcome message
     */
    welcomer() {
        bot.client.on('guildMemberAdd', async (member) => {
            if(member.bot) return;
            if(this.checkMaintenanceStatus === true) return;

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
    async getSubscriberCount() {
        const server = await bot.client.guilds.fetch("1251520688569974914");
        const channel = await server.channels.fetch("1382364642499887195");

        const result = await fetch('https://www.googleapis.com/youtube/v3/channels?key='+this.token[1]+'&part=statistics&forHandle=SpacePotatoee');
        const text = await result.json();

        let subCount = text['items'][0]['statistics']['subscriberCount'];
        let slicedCount = subCount.slice(0, -2);
        let finalCount = slicedCount.slice(0, -1) + '.' + slicedCount.slice(-1) + 'K';
        
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

    /**
     * Makes an API Request to github to pull commit info and returns the latest info
     * @param {String} RepoName Needs repository name in form of string
     * @param {String} RepoOwner Needs repository owner in form of string
     * 
     * @returns JSON as PROMISE
     */
    async githubApiReqCommit(RepoOwner, RepoName) {
        const temp = await fetch(`https://api.github.com/repos/${RepoOwner}/${RepoName}/commits?per_page=1`)

        return temp.json()
        
    }
    
    /**
     * Returns basic info from the APIReq function
     * @param {String} RepoName Needs repository name in form of string
     * @param {String} RepoOwner Needs repository owner in form of string
     * 
     * @returns JSON
     */
    async getBasicCommitInfo(RepoOwner, RepoName) {
        const commit_temp = await this.githubApiReqCommit(RepoOwner, RepoName) // idk what to call it but its the parents info, gets the repo commit data and caches it
        
        let latest_commit = {
            "author":commit_temp[0].commit.author.name,
            "date":new Date(commit_temp[0].commit.author.date).toUTCString(),
            "message":commit_temp[0].commit.message,
        }
        return latest_commit
    }

    maintenanceMode(msg) {

        if (!maintainers.includes(msg.author.id)) {return}

        let upd_config = JSON.parse(fs.readFileSync("./maintenancetoggle.json"))
        
        if (msg.content.toLowerCase().includes("on")) {
            upd_config.maintenance = true
            this.setName("FAQ | PotatoBot | Dev")
            fs.writeFileSync("./maintenancetoggle.json",JSON.stringify(upd_config,null,4))
            return
        }

        if (msg.content.toLowerCase().includes("off")) {
            upd_config.maintenance = false
            this.setName("FAQ | PotatoBot")
            fs.writeFileSync("./maintenancetoggle.json",JSON.stringify(upd_config,null,4))
            return
        }
        return
    }

    get checkMaintenanceStatus() {
        return JSON.parse(fs.readFileSync("./maintenancetoggle.json")).maintenance
    }

}

//


module.exports.potatobot = potatobot
