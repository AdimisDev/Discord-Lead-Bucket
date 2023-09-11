import express from 'express';
import bucketManager from '../database/bucketDB.js';
import { createBucketId } from '../utils/util.js';

const bucketRouter = express.Router();

// Route to get messages from a specific bucket
bucketRouter.get('/messages', async (req, res) => {
    try {
      const { serverId, channelId, memberId } = req.query;
      const bucketId = createBucketId(serverId, channelId, memberId);
  
      const messages = await bucketManager.getMessages(bucketId);

      let messageType = typeof messages;
      let messageLength = 0;
  
      if (Array.isArray(messages)) {
        messageType = 'array';
        messageLength = messages.length;
      } else if (typeof messages === 'string') {
        messageType = 'string';
        messageLength = messages.length;
      }
  
      const parseMessage = (message) => {
        try {
          return JSON.parse(message);
        } catch (parseError) {
          console.error("Error parsing a message:", parseError);
          return null;
        }
      };
  
      let parsedMessages = [];
  
      if (messageType === 'array') {
        parsedMessages = messages.map((message) => parseMessage(message)).filter((parsed) => parsed !== null);
      } else if (messageType === 'string') {
        try {
          parsedMessages = JSON.parse(messages);
        } catch (parseError) {
          console.error("Error parsing messages:", parseError);
          return res.status(500).json({ error: "Error parsing messages" });
        }
      }
  
      res.json(parsedMessages);
    } catch (error) {
      console.error("Error in /buckets route:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
});
  
// Route to get all buckets
bucketRouter.get('/', async (req, res) => {
    try {
      const allBuckets = await bucketManager.getAllBuckets();
      
      const bucketMessages = allBuckets.map((bucket) => bucket.messages);
  
      const parseMessage = (message) => {
        try {
          return JSON.parse(message);
        } catch (parseError) {
          console.error("Error parsing a message:", parseError);
          return null;
        }
      };
  
      const parsedMessages = bucketMessages.map((messages) =>
        messages.map((message) => parseMessage(message)).filter((parsed) => parsed !== null)
      );
  
      res.json(parsedMessages);
    } catch (error) {
      console.error("Error in POST /buckets route:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
});

// Route to add buckets
bucketRouter.post('/addBucket', async (req, res) => {
    const { serverId, channelId, memberId, oldMessage } = req.body;
    const bucketId = createBucketId(serverId, channelId, memberId);
    await bucketManager.addNewBucket(bucketId, oldMessage);
    res.status(201).json({ message: 'Bucket added successfully.' });
});

export default bucketRouter;
