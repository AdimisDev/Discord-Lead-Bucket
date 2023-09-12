import { Client } from 'discord.js-selfbot-v13';
import { handleMessageCreate } from './oldMessagesCollector.js';
import bucketManager from '../database/bucketDB.js';
import { shutdown } from '../utils/util.js';

export const client = new Client({ checkUpdate: false });
client.setMaxListeners(30);

let clientLoggedIn = false; // Track client login status
export let discord_token = null;

// SECTION: Start Discord Service
export async function startDiscordService(token) {
    discord_token = token
    console.log("Token from startDiscordService: ", token)
    try {
        await client.login(token);
        clientLoggedIn = true; // Set client login status to true
        console.log(`Logged in to discord as as ${client.user?.username}`)

        return client?.user.username
    } catch (e) {
        console.log(e);
    }
};

// SECTION: Start Discord Service
export function stopDiscordService() {
    try {
        client.destroy()
        clientLoggedIn = false; // Set client login status to true
        console.log(`Discord Bot Stopped...`)
    } catch (e) {
        console.log(e);
    }
};

// SECTION: Send Discord Message
export async function sendMessageDiscord(serverId, channelId, messageContent) {
  return new Promise(async (resolve, rejects) => {
      try {
          console.log('sendMessageDiscord: Started'); // Log that the function has started.
          if (!serverId) {
              console.log('sendMessageDiscord: Server ID is missing'); // Log when the server ID is missing.
              resolve(null);
          }

          const guild = client?.guilds?.cache?.get(serverId);
          if (!guild) {
              console.log('sendMessageDiscord: Guild not found'); // Log when the guild is not found.
              resolve(null);
          }
          if (channelId) {
              const channel = guild?.channels?.cache?.get(channelId);
              if (!channel || channel.type !== 'GUILD_TEXT') {
                  console.log('sendMessageDiscord: Channel not found or not a text channel'); // Log when the channel is not found or not a text channel.
                  throw new Error('Channel not found or not a text channel');
              }

              await channel.send({ content: messageContent });
              console.log('sendMessageDiscord: Message sent successfully'); // Log when the message is sent successfully.
              resolve(null);
          } else {
              const channels = guild?.channels?.cache?.filter(
                  (channel) => channel.type === 'GUILD_TEXT'
              );
              for (const channel of channels.values()) {
                  await channel.send(messageContent);
              }
              console.log('sendMessageDiscord: Message sent to all text channels'); // Log when the message is sent to all text channels.
              resolve(null);
          }
      } catch (e) {
          console.error('sendMessageDiscord: Error:', e.message); // Log any errors that occur.
          resolve(null);
      }
  });
}

// SECTION: Message Collector
client.on('messageCreate', async (message) => {
    if (clientLoggedIn) {
        if (message.channel.type === 'DM') {
            console.log('New Message on your DM from: ', message.author.username)
        } else {
            await handleMessageCreate(message, bucketManager, client);
        }
    }
});

// Handle shutdown signals (e.g., SIGINT, SIGTERM)
process.on('SIGINT', () => {
  shutdown();
});

process.on('SIGTERM', () => {
  shutdown();
});