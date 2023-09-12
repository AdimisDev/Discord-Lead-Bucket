// /home/adimis/Desktop/Discord-Lead-Bucket/index.js

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bucketManager from './src/database/bucketDB.js';
import { startDiscordService, shutdown } from './src/discordBot/bot.js'; // Import the shutdown function
import bucketRouter from './src/routes/bucket.js';
import discordRouter from './src/routes/discord.js';

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();

// Use the defined routes
app.use('/api/buckets', bucketRouter);
app.use('/api/discord', discordRouter);

async function run() {
  try {
    await bucketManager.connect();
    await startDiscordService(process.env.DISCORD_DEV_TOKEN);
  } catch (error) {
    console.error("Error:", error);
    shutdown(); // Call the shutdown function in case of an error during startup
  } finally {
    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}/api`);
    });

    // Handle server close event to gracefully shut down the Discord bot and other processes
    server.on('close', () => {
      shutdown();
    });
  }
}

run();
