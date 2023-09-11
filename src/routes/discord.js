import express from 'express';
import { sendMessageDiscord } from '../discordBot/bot.js';

const discordRouter = express.Router();

// Route to send a discord message on a server.
discordRouter.post('/send-message', async (req, res) => {
    const { serverId, channelId, content } = req.body;

    try {
        console.log('Route: /send-message called'); // Log when the route is called.
        if (!serverId || !channelId || !content) {
            console.log('Route: Invalid request parameters'); // Log when the request parameters are invalid.
            throw new Error('Server, Channel, and content are required fields.');
        }

        const response = await sendMessageDiscord(serverId, channelId, content);
        res.status(200).json({ success: true, response });
        console.log('Route: Message sent successfully'); // Log when the message is sent successfully.
    } catch (error) {
        console.error('Route: Error:', error.message); // Log any errors that occur in the route.
        res.status(500).json({ success: false, error: error.message });
    }
});

export default discordRouter;
