import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import { searchOldMessages } from '../discordBot/newMessageCollector.js';
import { parseBucketId } from '../utils/util.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

class BucketManager {
    constructor(uri, dbName, collectionName) {
        this.client = new MongoClient(uri, {
          serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
          },
        });
        this.dbName = dbName;
        this.collectionName = collectionName;
    }

    async connect() {
        await this.client.connect();
        console.log("Connected to MongoDB Atlas!");
    }

    async addNewBucket(bucketId, oldMessage = false) {
        let parsedMsg;    
        const db = this.client.db(this.dbName);
        const bucketCollection = db.collection(this.collectionName);
    
        // Check if a bucket with the same bucketId already exists
        const existingBucket = await bucketCollection.findOne({ bucketId: bucketId });
    
        if (!existingBucket) {
            // If it doesn't exist, insert a new bucket
            if (oldMessage) {
                const { serverId, channelId, memberId } = parseBucketId(bucketId);
                console.log(`Retrieving old messages from addNewBucket for serverId: ${serverId}, channelId: ${channelId}, memberId: ${memberId}`, )
                const msg = await searchOldMessages(bucketId, 0);
                console.log(`Old Messages: `, msg)
                parsedMsg = JSON.stringify(msg, null, 2);
            } else {
                parsedMsg = [];
            }
            const bucket = { bucketId: bucketId, messages: parsedMsg };
            await bucketCollection.insertOne(bucket);
        }
    }    

    async updateBucket(bucketId, updatedData) {
        const db = this.client.db(this.dbName);
        const bucketCollection = db.collection(this.collectionName);
        await bucketCollection.updateOne({ bucketId: bucketId }, { $set: updatedData });
    }

    async deleteBucket(bucketId) {
        const db = this.client.db(this.dbName);
        const bucketCollection = db.collection(this.collectionName);
        await bucketCollection.deleteOne({ bucketId: bucketId });
    }

    async deleteAllBuckets() {
        const db = this.client.db(this.dbName);
        const bucketCollection = db.collection(this.collectionName);
        await bucketCollection.deleteMany({});
    }

    async getBucket(bucketId) {
        const db = this.client.db(this.dbName);
        const bucketCollection = db.collection(this.collectionName);
        const bucket = await bucketCollection.findOne({ bucketId: bucketId });

        const jsonFilePath = '/home/adimis/Desktop/Discord-Lead-Bucket/data/oldMessagebuckets.json';
        const directoryPath = path.dirname(jsonFilePath);
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }
        try {
            fs.writeFileSync(jsonFilePath, JSON.stringify(bucket, null, 2));
        } catch (err) {
            console.error(`Error writing to file: ${jsonFilePath}`);
            throw err;
        }

        return bucket;
    }

    async getAllBuckets() {
        const db = this.client.db(this.dbName);
        const bucketCollection = db.collection(this.collectionName);
        const buckets = await bucketCollection.find({}).toArray();
        
        const jsonFilePath = '/home/adimis/Desktop/Discord-Lead-Bucket/data/buckets.json';
        const directoryPath = path.dirname(jsonFilePath);
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }
        try {
            fs.writeFileSync(jsonFilePath, JSON.stringify(buckets, null, 2));
        } catch (err) {
            console.error(`Error writing to file: ${jsonFilePath}`);
            throw err;
        }

        /* `buckets:`
        [
            {
                "_id": "650020e4f1e54034a86d8fec",
                "bucketId": "991717889675640842/991717949335412818/null",
                "messages": [
                "[{\"id\":\"1151041035489783903\",\"type\":0,\"content\":\"Test msg from BucketAPITester-013!\",\"channel_id\":\"991717949335412818\",\"author\":{\"id\":\"991717264413954079\",\"username\":\"adimis.\",\"global_name\":\"adimis\",\"avatar\":\"0d71dc2fe9f0588c81aaf853674823e5\",\"discriminator\":\"0\",\"public_flags\":0,\"avatar_decoration_data\":null},\"attachments\":[],\"embeds\":[],\"mentions\":[],\"mention_roles\":[],\"pinned\":false,\"mention_everyone\":false,\"tts\":false,\"timestamp\":\"2023-09-12T06:26:08.169000+00:00\",\"edited_timestamp\":null,\"flags\":0,\"components\":[],\"hit\":true}]"
                ]
            },
            {
                "_id": "650033b83071f79b0969764b",
                "bucketId": "1085484460767723560/1087460044565659668/null",
                "messages": [
                "{\"id\":\"1151058688812003388\",\"type\":0,\"content\":\"thank you so much!\",\"channel_id\":\"1087460044565659668\",\"author\":{\"id\":\"827599345750245446\",\"username\":\"indianarmsdealer\",\"global_name\":\"Indianarmsdealer\",\"avatar\":\"bf526b48e21cbdb5324b9f6154df8d84\",\"discriminator\":\"0\",\"public_flags\":0,\"avatar_decoration_data\":null},\"attachments\":[],\"embeds\":[],\"mentions\":[],\"mention_roles\":[],\"pinned\":false,\"mention_everyone\":false,\"tts\":false,\"timestamp\":\"2023-09-12T07:36:17.049000+00:00\",\"edited_timestamp\":null,\"flags\":0,\"components\":[],\"hit\":true,\"images\":[],\"documents\":[],\"authorName\":\"indianarmsdealer\",\"authorId\":\"827599345750245446\",\"channelId\":\"1087460044565659668\",\"guildId\":\"1085484460767723560\",\"roleColor\":\"#fe47e3\",\"createdTimestamp\":\"Tue Sep 12 2023 13:06:17 GMT+0530 (India Standard Time)\",\"avatarURL\":\"https://cdn.discordapp.com/avatars/827599345750245446/bf526b48e21cbdb5324b9f6154df8d84.webp\"}"
                ]
            }
        ]
        */

        return buckets;
    }
    
    // Method to push one message to a bucket's messages array
    async pushMessageToBucket(bucketId, message) {
        console.log("Inside pushMessageToBucket Method...")
        const db = this.client.db(this.dbName);
        const bucketCollection = db.collection(this.collectionName);

        const existingBucket = await bucketCollection.findOne({ bucketId: bucketId });

        if (!existingBucket) {
            console.log(`Bucket with id ${bucketId} does not exist. Creating a new bucket...`);
            await this.addNewBucket(bucketId);
            console.log(`New bucket with id ${bucketId} created.`);
        }

        await bucketCollection.updateOne(
            { bucketId: bucketId },
            { $push: { messages: message } }
        );
        console.log("Message added in the bucket...", bucketId)
    }    

    // Method to push messages array to a bucket's messages array
    async pushMessagesToBucket(bucketId, messages) {
        try {
            const db = this.client.db(this.dbName);
            const bucketCollection = db.collection(this.collectionName);

            const existingBucket = await bucketCollection.findOne({ bucketId: bucketId });

            if (!existingBucket) {
                console.log(`Bucket with id ${bucketId} does not exist. Creating a new bucket...`);
                await this.addNewBucket(bucketId);
                console.log(`New bucket with id ${bucketId} created.`);
            }

            // Iterate through the messages array and push each message to the bucket
            for (const message of messages) {
                await bucketCollection.updateOne(
                    { bucketId: bucketId },
                    { $push: { messages: message } }
                );
            }
            console.log('Messages pushed to the bucket');
        } catch (error) {
            console.error('Error pushing messages to the bucket:', error);
        }
    }

    async getMessages(bucketId) {
        try {
            console.log(`Fetching messages for bucketId: ${bucketId}`);
    
            const db = this.client.db(this.dbName);
            console.log(`Connected to database: ${this.dbName}`);
    
            const bucketCollection = db.collection(this.collectionName);
            console.log(`Accessed collection: ${this.collectionName}`);
    
            const bucket = await bucketCollection.findOne({ bucketId: bucketId });
            console.log(`Found bucket:`, bucket);
    
            if (bucket) {
                console.log(`Returning messages:`, bucket.messages);
                return bucket.messages;
            } else {
                console.log(`Bucket not found, returning an empty array.`);
                return [];
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }    
    
    async deleteAllMessages(bucketId) {
        const db = this.client.db(this.dbName);
        const bucketCollection = db.collection(this.collectionName);
        
        await bucketCollection.updateOne(
            { bucketId: bucketId },
            { $set: { messages: [] } }
        );
    }

    async close() {
        await this.client.close();
        console.log("Disconnected from MongoDB Atlas.");
    }
}

// MongoDB URI and database/collection names
const uri = process.env.MONGODB_DEV_URI;
const bucket_dbName = process.env.BUCKET_DEV_DB_NAME
const bucket_collectionName = process.env.BUCKET_DEV_COLLECTION_NAME

// Create instances of the managers
const bucketManager = new BucketManager(uri, bucket_dbName, bucket_collectionName);

export default bucketManager;
