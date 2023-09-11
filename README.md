
# Discord Lead Bucket - Express.js and MongoDB Project

## Description

This is a Discord bot project that uses Express.js for the API and MongoDB for data storage. It's designed to collect and manage messages from Discord servers, allowing users to search and retrieve messages from specific channels and members.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your local machine.
- MongoDB database set up and running.
- Discord bot token for authentication.

## Installation

To get started with this project, follow these steps:

1. Clone the repository:

   ```shell
   git clone https://github.com/yourusername/Discord-Lead-Bucket.git
   ```

2. Install the project dependencies:

   ```shell
   cd Discord-Lead-Bucket
   npm install
   ```

3. Create a `.env` file in the project root directory and add your Discord bot token:

   ```shell
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   ```

4. Start the application:

   ```shell
   npm start
   ```

## Usage

- Once the application is running, your Discord bot will be active and listening for messages in the specified servers and channels.
- You can interact with the bot to collect and manage messages.
- Use the provided API routes to retrieve messages from specific buckets.

## API Routes

### Get Messages from a Specific Bucket

- **Route:** `/api/buckets`
- **Method:** `GET`
- **Parameters:**
  - `serverId` (optional): Discord server ID.
  - `channelId` (optional): Discord channel ID.
  - `memberId` (optional): Discord member ID.

Returns messages from the specified bucket.

### Get All Buckets and Their Messages

- **Route:** `/api/buckets`
- **Method:** `POST`

Returns all buckets and their associated messages.

### Add a New Bucket

- **Route:** `/api/buckets/add`
- **Method:** `POST`
- **Request Body:**
  - `serverId`: Discord server ID.
  - `channelId`: Discord channel ID.
  - `memberId`: Discord member ID.
  - `oldMessage`: Message content.

Adds a new bucket to collect messages.

## Dockerization

The project includes a Dockerfile for containerization:

- `Dockerfile`

You can build a Docker image and run the application inside a Docker container using the following commands:

1. Build a Docker image for your project:

   ```shell
   docker build -t discord-lead-bucket .
   ```

   This command will build a Docker image named `discord-lead-bucket` using the `Dockerfile` in the project directory.

2. Run a Docker container from the built image:

   ```shell
   docker run -d -p 8020:8020 --name discord-lead-bucket-container discord-lead-bucket
   ```

   - `-d`: Runs the container in detached mode (in the background).
   - `-p 8020:8020`: Maps port 8020 from the container to port 8020 on your host machine. Adjust this port mapping as needed.
   - `--name discord-lead-bucket-container`: Names the container as `discord-lead-bucket-container`.

   Now, your Express.js and MongoDB project is running inside a Docker container, and you can access it through port 8020 on your host machine.

3. To stop and remove the container when you're done:

   ```shell
   docker stop discord-lead-bucket-container
   docker rm discord-lead-bucket-container
   ```

4. To remove the Docker image:

   ```shell
   docker rmi discord-lead-bucket
   ```

These Docker commands will help you containerize your project and manage the Docker container effectively. Make sure to customize the port mappings and container names according to your project's needs.