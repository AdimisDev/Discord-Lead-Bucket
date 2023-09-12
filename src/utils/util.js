export const createBucketId = (serverID, channelID, memberID) => {
  const channelIDStr = [null, 'null', 'undefined', 'None'].includes(channelID) ? 'null' : channelID;
  const memberIDStr = [null, 'null', 'undefined', 'None'].includes(memberID) ? 'null' : memberID;
  const bucketID = `${serverID}/${channelIDStr}/${memberIDStr}`;
  return bucketID;
};

export const parseBucketId = (bucketID) => {
    const [serverID, channelIDStr, memberIDStr] = bucketID.split('/');
    const channelID = channelIDStr !== 'null' ? channelIDStr : null;
    const memberID = memberIDStr !== 'null' ? memberIDStr : null;
    return {
        serverId: serverID,
        channelId: channelID,
        memberId: memberID
    };
};

export function parseMessagesArray(array) {
    console.log("Array from parseMessagesArray: ", arr)
    const parsedArray = array.map(item => {
      try {
        return JSON.parse(item);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
      }
    });
    return parsedArray;
};

export const shutdown = async () => {
  console.log('Shutting down...');
  process.exit(0);
};