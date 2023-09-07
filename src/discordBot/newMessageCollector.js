import axios from 'axios';
import { messageProcessorDriver } from './messageProcessor.js';
import { createBucketId } from '../utils/util.js';
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
    'Authorization': 'OTkxNzE3MjY0NDEzOTU0MDc5.GeoaHG.Z2Ro7Dn1hF0fzJpcuOGN0lVCtt_7vTMTg5Danw', 
    'Cookie': '__cfruid=71e92d924404093f324c5d5e14ab6311def64642-1692389833; __dcfduid=e8bb4056ee7311ed9bfabaf4e1a8a31d; __sdcfduid=e8bb4056ee7311ed9bfabaf4e1a8a31d8738305cf4c59d94ab133d2b2325d8bdc45f421fca86b9db5b4880acdac58f74'
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

export const getMessageApi = async (serverID, channelID, memberID, offset) => {
    try {
      const url = fetchURLGenerator(serverID, offset, channelID, memberID);
      const config = generateConfig(url);
      const responseData = await fetchDataFromURL(config);
      const messages = responseData.messages;
      const bucketId = createBucketId(serverID, channelID, memberID);
  
      const processedMessages = await Promise.all(messages.map(async (message) => {
        return await messageProcessorDriver(message, bucketId, client);
      }));
  
      return processedMessages;
  
    } catch (e) {
      console.log(e);
    }
};
  