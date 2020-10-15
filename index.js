import fs from 'fs';
import fetch from 'node-fetch';
import Discord from 'discord.js';

async function getNewPosts(limit = 10) {
    const url = `https://www.reddit.com/r/FrugalMaleFashion/new/.json?limit=${limit}`;
    const response = await fetch(url);
    const body = await response.json();
    return body.data.children.map(
        (post) => {
            const { data: { id, url, title } } = post;
            return { id, url, title };
    });
}

function isPostNew(currentPosts, newPost) {
    for (const cp of currentPosts) {
        if (cp.id === newPost.id) {
            return false;
        }
    }
    return true;
}

function newPostMessages(channel, newPosts) {
}

async function main() {
    const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    const client = new Discord.Client();
    await client.login(config.token);
    console.log("Logged into Discord");

    let currentPosts = await getNewPosts();
    console.log("Running...");
    while(true) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const newPosts = 
            (await getNewPosts())
            .filter(post => isPostNew(currentPosts, post));
        currentPosts = currentPosts.concat(newPosts);

        if (newPosts.length > 0) {
            console.log(newPosts);
            for (const [_, guild] of client.guilds.cache) {
                for (const [_, channel] of guild.channels.cache) {
                    if (channel.name === "clothing-deals") {
                        console.log(`Posting to ${channel.name}`);
                        for (const {url, title} of newPosts) {
                            channel.send(`${title}\n${url}`);
                        }
                    }
                }
            }
        }
    }
}

main();

