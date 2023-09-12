import { messageProcessorDriver } from './messageProcessor.js';
import { parseBucketId } from '../utils/util.js';

// SECTION: Collect messages Driver
function collect_message_driver (message, bucketId) {
    const message_serverId = message?.guild?.id || null;
    const message_channelId = message?.channel?.id || null;
    const message_memberId = message?.author?.id || null;

    const {serverId, channelId, memberId} = parseBucketId(bucketId);

    const desired_serverId = serverId;
    const desired_channelId = channelId;
    const desired_memberId = memberId;

    if (desired_serverId !== null) {
        if (desired_channelId === null && desired_memberId === null) {
            if (message_serverId === desired_serverId) {
                console.log("New Message Found...")
                return message
            }
        } else if (desired_channelId !== null) {
            if (desired_memberId === null) {
                if (message_serverId === desired_serverId && message_channelId === desired_channelId) {
                    console.log("New Message Found...")
                    return message
                }
            } else if (desired_memberId !== null) {
                if (message_serverId === desired_serverId && message_channelId === desired_channelId && message_memberId === desired_memberId) {
                    console.log("New Message Found...")
                    return message
                }
            }
        }
    }
    return null;
};

export async function handleMessageCreate(message, bucketManager, client) {
    try {
        const allBuckets = await bucketManager.getAllBuckets();
        const bucketIds = allBuckets.map(bucket => bucket.bucketId);

        const processingPromises = bucketIds.map(async (bucketId) => {
            const filteredMessage = collect_message_driver(message, bucketId);
            await messageProcessorDriver(filteredMessage, bucketId, client);
        });

        await Promise.all(processingPromises);
    } catch (e) {
    }
};



