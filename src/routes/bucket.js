import express from 'express';
import bucketManager from '../database/bucketDB.js';
import { createBucketId } from '../utils/util.js';

const bucketRouter = express.Router();

// Route to get messages from a specific bucket
bucketRouter.get('/messages/:serverId/:channelId/:memberId', async (req, res) => {
    try {
      const { serverId, channelId, memberId } = req.params;
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

// Route to add a message to a bucket
bucketRouter.post('/addMessage/:serverId/:channelId/:memberId', async (req, res) => {
  try {
      const { serverId, channelId, memberId } = req.params;
      const bucketId = createBucketId(serverId, channelId, memberId);
      const { message } = req.body;
      await bucketManager.addMessage(bucketId, message);
      res.json({ message: 'Message added to the bucket successfully.' });
  } catch (error) {
      console.error("Error in POST /addMessage route:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to delete a message from a bucket
bucketRouter.delete('/deleteMessage/:serverId/:channelId/:memberId', async (req, res) => {
  try {
      const { serverId, channelId, memberId } = req.params;
      const bucketId = createBucketId(serverId, channelId, memberId);
      const { message } = req.body;
      await bucketManager.deleteMessage(bucketId, message);
      res.json({ message: 'Message deleted from the bucket successfully.' });
  } catch (error) {
      console.error("Error in DELETE /deleteMessage route:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to delete all messages from a bucket
bucketRouter.delete('/deleteAllMessages/:serverId/:channelId/:memberId', async (req, res) => {
  try {
      const { serverId, channelId, memberId } = req.params;
      const bucketId = createBucketId(serverId, channelId, memberId);
      await bucketManager.deleteAllMessages(bucketId);
      res.json({ message: 'All messages deleted from the bucket successfully.' });
  } catch (error) {
      console.error("Error in DELETE /deleteAllMessages route:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});
  
// Route to get all buckets
bucketRouter.get('/', async (req, res) => {
  try {
    console.log("Fetching all buckets...");
    const allBuckets = await bucketManager.getAllBuckets();
    const bucketMessages = allBuckets.map((bucket) => bucket.messages);
    res.json({bucketMessages});
  } catch (error) {
    console.error("Error in GET /buckets route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to add a new bucket
bucketRouter.post('/addBucket', async (req, res) => {
  try {
      console.log("Inside /addBucket route...")
      const { serverId, channelId, memberId, oldMessage } = req.body;
      console.log("Received Body: ", serverId, channelId, memberId, oldMessage)
      const bucketId = createBucketId(serverId, channelId, memberId);
      await bucketManager.addNewBucket(bucketId, oldMessage);
      res.status(201).json({ message: 'Bucket added successfully.' });
  } catch (error) {
      console.error("Error in POST /addBucket route:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to update a bucket
bucketRouter.put('/updateBucket/:serverId/:channelId/:memberId', async (req, res) => {
  try {
      const { serverId, channelId, memberId } = req.params;
      const bucketId = createBucketId(serverId, channelId, memberId);
      const updatedData = req.body;
      await bucketManager.updateBucket(bucketId, updatedData);
      res.json({ message: 'Bucket updated successfully.' });
  } catch (error) {
      console.error("Error in PUT /updateBucket route:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to delete a bucket
bucketRouter.delete('/deleteBucket/:serverId/:channelId/:memberId', async (req, res) => {
  try {
      const { serverId, channelId, memberId } = req.params;
      const bucketId = createBucketId(serverId, channelId, memberId);
      await bucketManager.deleteBucket(bucketId);
      res.json({ message: 'Bucket deleted successfully.' });
  } catch (error) {
      console.error("Error in DELETE /deleteBucket route:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to delete all buckets
bucketRouter.delete('/deleteAllBuckets', async (req, res) => {
  try {
      await bucketManager.deleteAllBuckets();
      res.json({ message: 'All buckets deleted successfully.' });
  } catch (error) {
      console.error("Error in DELETE /deleteAllBuckets route:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

export default bucketRouter;
