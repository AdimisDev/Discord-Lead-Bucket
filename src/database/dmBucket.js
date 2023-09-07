import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class DmBucketManager {
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
}

// MongoDB URI and database/collection names
const uri = process.env.MONGODB_DEV_URI;
const dm_dbName = process.emv.DM_DEV_DB_NAME
const dm_collectionName = process.env.DM_DEV_COLLECTION_NAME

// Create instances of the managers
const dmBucketManager = new DmBucketManager(uri, dm_dbName, dm_collectionName);

export default dmBucketManager;