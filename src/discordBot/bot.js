import { Client } from 'discord.js-selfbot-v13';
import { handleMessageCreate } from './oldMessagesCollector.js';
import bucketManager from '../database/bucketDB.js';

export const client = new Client({ checkUpdate: false });

// SECTION: Start Discord Service
export async function startDiscordService(token) {
    console.log("Token from startDiscordService: ", token)
    try {
      await client.login(token);
      console.log(`Logged in as ${client.user?.username}`)
    } catch (e) {
      console.log(e);
    }
};

export const sendDMMessage = async (channel, content) => {
  const res = await channel.send(content);
  console.log("sendDMMessage: ", res)
}

// SECTION: Message Collector
client.on('messageCreate', async (message) => {
  if (message.channel.type === 'DM') {
    console.log("Current Message: ", message.cleanContent)
    console.log("Channel Id: ", message.channel.id)
  } else {
    await handleMessageCreate(message, bucketManager, client);
  }
});