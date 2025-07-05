const { EmbedBuilder } = require("@discordjs/builders");
const config = require("./config.json");
const logging = require("./logging.json");
const {Client, Partials, GatewayIntentBits, REST, Routes, BaseInteraction} = require("discord.js");
const fs = require("node:fs");

/** A Potatobot instance is essentially what a Client is to discord.js. So close, in fact, that they are entirely tied together. This class will usually only be instanced once but if you need you can make as many as you like, as long as they are all linked to different Client objects. */
module.exports = class Potatobot {
    /**
     * Creates a new instance of the bot. This will then be linked with a discord.js Client object.
     * @param {Client} client - The Client that this instance will be linked to.
     */
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages, 
                GatewayIntentBits.DirectMessages, 
                GatewayIntentBits.GuildMessageReactions
            ],
            partials: [Partials.Reaction]
        });
        this.rest = new REST({ version: '10' });

        this.client.on("ready", async (client) => {
            console.log(client.readyTimestamp +" testing123");

            // Initialise Commands

            this.loadedCommands = {}
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            for (let commandFile of commandFiles) {
                let command = require("./commands/"+commandFile);
                this.loadedCommands[command.data.name] = command;
            }

            if (config.enableCommands) {
                this.rest.put(
                    Routes.applicationCommands(client.application.id),
                    { body: Object.values(this.loadedCommands).map(command=>command.data.toJSON()) },
                );
            } else {
                this.rest.put( 
                    Routes.applicationCommands(client.application.id),
                    { body: [] }, // just put an empty array to clear commands maybe
                );
            }
        });

        this.client.on("interactionCreate", async (interaction) => {
            if (interaction.isChatInputCommand() && Object.keys(this.loadedCommands).includes(interaction.commandName)) {
                this.loadedCommands[interaction.commandName].func(interaction);
            }
        });

        this.client.on("messageCreate", async (msg) => {
            if(msg.author.bot)return;
            
            if (config.enableAutoreact && (msg.mentions.has(this.client.user)||msg.content.toLowerCase().includes("potatobot")) && (msg.content.toLowerCase().includes("sucks")||msg.content.toLowerCase().includes("i hate")||msg.content.toLowerCase().includes("is bad")||msg.content.toLowerCase().includes("is ass")||msg.content.toLowerCase().includes("beat our child")||msg.content.toLowerCase().includes("disown"))) {
                msg.react("😢")
                msg.react("🫃")
            }
        })
    }

    /** The log function has identical parameters to Channel.send, and essentially acts as a passthrough for that. You do not need to await this function unless you want to make sure the message has been sent. */
    async log(...args) {
        if (!this.client.isReady()) {return;}
        this.logChannel = this.logChannel ?? await this.client.channels.fetch(logging.channelId);
        this.logChannel.send(...args);
    }

    login(token) {
        this.client.login(token);
        this.rest.setToken(token);
    }
}