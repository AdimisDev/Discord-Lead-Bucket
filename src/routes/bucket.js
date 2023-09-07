import express from 'express';
import bucketManager from '../database/bucketDB.js';
import { createBucketId, parseMessagesArray } from '../utils/util.js';

const bucketRouter = express.Router();

// Route to get messages from a specific bucket
bucketRouter.get('/buckets', async (req, res) => {
    const { serverId, channelId, memberId } = req.query;
    const bucketId = createBucketId(serverId, channelId, memberId);
    const messages = await bucketManager.getMessages(bucketId);
    const parsedMessages = parseMessagesArray(messages)
    res.json(parsedMessages);
});
  
// Route to get all buckets
bucketRouter.post('/buckets', async (req, res) => {
    const allBuckets = await bucketManager.getAllBuckets();
    const bucketMessages = allBuckets.map(bucket => bucket.messages);
    const parsedMessages = parseMessagesArray(bucketMessages)
    res.json(parsedMessages);
});

// Route to add buckets
bucketRouter.post('/buckets/add', async (req, res) => {
    const { serverId, channelId, memberId, oldMessage } = req.body;
    const bucketId = createBucketId(serverId, channelId, memberId);
    await bucketManager.addNewBucket(bucketId, oldMessage);
    res.status(201).json({ message: 'Bucket added successfully.' });
});

export default bucketRouter;
