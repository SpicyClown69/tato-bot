    if (msg.content.toLowerCase().includes("<@1360807782001148134> wiki_unplanned") && msg.author.id.includes("520961867368103936")) {
        setTimeout(() => {response.delete()}, 1200_000)
        const response = await msg.reply({
            components: [w.wikiCreatorHome()],
            flags: MessageFlags.IsComponentsV2
        });
    }

    if (msg.content.toLowerCase().includes("<@1360807782001148134> links")) {
        setTimeout(() => {response.delete()}, 1200_000)
        const response = await msg.reply({
            components: [w.linkCreator()],
            flags: MessageFlags.IsComponentsV2
        });
    }
