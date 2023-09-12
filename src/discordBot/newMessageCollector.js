import axios from 'axios';
import { messageProcessorDriver } from './messageProcessor.js';
import { createBucketId, parseBucketId } from '../utils/util.js';
import { client } from './bot.js';

let data = '';

const fetchURLGenerator = (serverID, offset, channelID, memberID) => {
  const params = new URLSearchParams();
  if (channelID && channelID.toLowerCase() !== 'null') params.append('channel_id', channelID);
  if (memberID && memberID.toLowerCase() !== 'null') params.append('author_id', memberID);
  params.append('offset', offset);

  const url = `https://discord.com/api/v9/guilds/${serverID}/messages/search?${params.toString()}`;
  return url;
};

const generateConfig = (url) => ({
  method: 'get',
  maxBodyLength: Infinity,
  url: url,
  headers: { 
    'Authorization': 'OTkxNzE3MjY0NDEzOTU0MDc5.GItUYI.74XHkcphB86xrpWOnPQHondLqgUlcROKTdo-FU', 
  },
  data: data
});

const fetchDataFromURL = async (config) => {
  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchOldMessages = async (bucketId, offset) => {
  const { serverId, channelId, memberId } = parseBucketId(bucketId)
  try {
      console.log('searchOldMessages - Parsing bucketId:', { serverId, channelId, memberId });

      const url = fetchURLGenerator(serverId, offset, channelId, memberId);
      console.log('searchOldMessages - Generated URL:', url);

      const config = generateConfig(url);
      console.log('searchOldMessages - Generated Config:', config);

      const responseData = await fetchDataFromURL(config);

      const messages = responseData.messages;
      console.log('searchOldMessages - Fetched Messages from URL:', messages);
      const bucketId = createBucketId(serverId, channelId, memberId);

      console.log('searchOldMessages - Processing Messages...');
      const processedMessages = await Promise.all(messages.map(async (message) => {
          const processedMessage = await messageProcessorDriver(message[0], bucketId, client);
          return processedMessage;
      }));

      console.log('searchOldMessages - Processed Messages...');

      console.log('searchOldMessages - Processed Messages:', processedMessages);
      return processedMessages;

  } catch (e) {
      console.error('searchOldMessages Error:', e);
  }
};