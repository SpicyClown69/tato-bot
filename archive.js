const {Client, EmbedBuilder, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require("discord.js")
const {Ollama} = require("ollama")
const config = require("./config.json")
const token = require("./token.json")

// use this for ai stuff, not oltemp
const ollama = new Ollama()

const client = new Client({intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
]})


//---------------------------------------------------------------------------
// actual code starts here

client.on("messageCreate", async (message) => {
    // does the message contain any of the filter strings? if so, go to ai
    //if (!config.main_filter.some(filter => message.content.includes(filter))) {return}
    if (message.author.bot) {return}
    if (filterCheck(message) === false) {return}
    console.log("match found in "+message.content)

    try {
        // feed the ai guidelines and user prompt
        // this shit fucking sucks aaaaaaasssssssss oh my goodddddd
        const feed = [
            { role: "system", content: `YOU DO NOT RETURN ANY OF YOUR THOUGHT PROCESS, ONLY YOUR FINAL ANSWER. YOU ARE MADE TO READ THE QUESTION ASKED, AND JUDGE WHAT TYPE OF QUESTION IS ASKED.
                BELOW IS A LIST OF ALL THE VALID TYPES. A "," DICTATES A NEW TYPE. YOU WILL NOT SEARCH FOR THE OUTPUT TYPE IN THE PROMPT YOU WILL ONLY ANSWER AS A VALID TYPE. YOU WILL TAKE INTO CONSIDERATION THE ENTIRE PROMPT. IF ONE WORD MATCHES THE TYPE YOU DO NOT MAKE THAT YOUR ANSWER UNTIL YOU HAVE FULLY CONSIDERED
                LIST:
                    
                    RETURN "shaders" if the user is asking about how to remove the shaders NOT VHS EFFECTS / MOTION BLUR / CAMERA MOVEMENT?,
                    RETURN "multiplayer" if the user asking how to play with friends or on a server?,
                    RETURN "enter" if the user asking how to "noclip" / "enter" / "get into" / "get the" referring to things about entering a map or the backrooms? YOU WILL ACCEPT [INSTALL MAP / DOWNLOAD MAP / get the map],
                    RETURN "error" if the user saying that the mod will not load / crashes / doesnt open?,
                    RETURN "install" if the user asking how to install a mod DO NOT ACCEPT MAP?,
                END OF LIST!!!!
                IF THE PROMPT IS NOT AIMED AT THE MOD THEN IGNORE EVERYTHING AND RETURN "no"
                YOU SEND WHAT CATEGORY YOU THINK IS THE BEST ANSWER
                YOU DO NOT GIVE AN ANSWER JUST BECAUSE A TOKEN MATCHES A TYPE. YOU WILL FOLLOW THE MEANINGS
                
                GIVE A VERY VERY SLIGHT LENIENCY IN WHAT MATCHES THE MEANING OF AN ITEM. PEOPLE PHRASE THINGS DIFFERENTLY.`
        },{ role: "user" , content: message.content }]

        const response = ollama.chat({ 
                model: "qwen2.5:1.5b",  
                messages: feed
        })
        // absolute cinema of a proofing thing
        const c = ((await response).message.content.replace("\"","").replace("\"","")).split(" ")[0].toLowerCase()
        console.log(c)

        const faq = new EmbedBuilder()
            .setThumbnail("https://cdn.modrinth.com/data/H6pjI7Ol/831ad01659612e42dc2adfe6bcf00b3a4a5515f4_96.webp")
            .addFields(
                {name: config.faq[c].name, value: config.faq[c].value}
            )
            .setColor(0xFFCC00)
            .setFooter({text: "Powered by qwen2.5:1.5b, may get your question wrong | Dont want messages from me? Click the button below!"})

        // await message.reply({embeds:[faq]})

        //do stuff with the buttons, to make it so you can block the bot
        const block = new ButtonBuilder()
            .setCustomId("block")
            .setLabel("Block")
            .setStyle(ButtonStyle.Primary)
        const cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Primary)
        const row = new ActionRowBuilder()
            .addComponents(block, cancel)
        const filter = (m) => m.author.id === message.author.id
        const button_response = await message.reply({
            embeds: [faq] ,
            components: [row],
        });
        try {
            const confirmation = button_response.resource.message.awaitMessageComponent({ filter: filter, time: 60_000});
            if (confirmation.customId === 'block') {
                const embed = new EmbedBuilder()
                    .setTitle("Are you sure?")
                    .setDescription("You can always change your mind with /unblock")
                await confirmation.editReply({ embeds: [embed], components: [] });
            }
        } catch {
            const embed = new EmbedBuilder()
                .setTitle("No input was recieved in 60 seconds... cancelling")
                .setColor("Red")
            await message.edit({ embeds: [embed], components: [] });
        }
    } catch (e) {
        console.log(e)
    }
})

function filterCheck(message) {
    for (var i = 0; i < config.main_filter.length; i++) {
        if (message.content.toLowerCase().includes(config.main_filter[i])) {
            console.log(config.main_filter[i])
            return true
        }
    }
    return false
}

client.login(token[0])
client.on("ready", () => { console.log("started")})
