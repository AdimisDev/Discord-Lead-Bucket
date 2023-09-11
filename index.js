import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bucketManager from './src/database/bucketDB.js';
import { startDiscordService } from './src/discordBot/bot.js';
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
  } finally {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}/api`);
    });
  }
}

run();
