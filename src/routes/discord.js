import express from 'express';
import { sendMessageDiscord } from '../discordBot/bot.js';
import { searchOldMessages } from '../discordBot/newMessageCollector.js';
import { createBucketId } from '../utils/util.js';
import bucketManager from '../database/bucketDB.js';

const discordRouter = express.Router();

// Route to send a discord message on a server.
discordRouter.post('/send-message', async (req, res) => {
    const { serverId, channelId, content } = req.body;

    try {
        console.log('Route: /send-message called');
        if (!serverId || !channelId || !content) {
            console.log('Route: Invalid request parameters');
            throw new Error('Server, Channel, and content are required fields.');
        }

        const response = await sendMessageDiscord(serverId, channelId, content);
        res.status(200).json({ success: true, response });
        console.log('Route: Message sent successfully');
    } catch (error) {
        console.error('Route: Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route to get old messages.
discordRouter.get('/search-old-message/:serverId/:channelId/:memberId/:offset', async (req, res) => {
    const { serverId, channelId, memberId, offset } = req.params;

    // Log incoming parameters
    console.log(`Inside /search-old-message/:serverId/:channelId/:memberId/:offset`);
    console.log(`serverId: ${serverId}`);
    console.log(`channelId: ${channelId}`);
    console.log(`memberId: ${memberId}`);
    console.log(`offset: ${offset}`);

    const bucketId = createBucketId(serverId, channelId, memberId);

    try {        
        if (!serverId || serverId.toLowerCase() === 'null' || serverId.toLowerCase() === 'undefined' || serverId.toLowerCase() === 'none') {
            console.log('Route: Invalid serverId parameter');
            throw new Error('ServerId is a required field.');
        }

        // Convert offset to an integer and handle null/undefined/None cases
        const parsedOffset = parseInt(offset);
        const validOffset = !isNaN(parsedOffset) && parsedOffset > 0 ? parsedOffset : 0;

        await searchOldMessages(bucketId, validOffset);

        const bucket = await bucketManager.getBucket(bucketId);

        // Log bucket information
        console.log("Bucket from /search-old-message/:serverId/:channelId/:memberId/:offset:");
        console.log(bucket);

        res.status(200).json({ success: true, bucket });
    } catch (error) {
        console.error('Route: Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default discordRouter;
