import { parseBucketId } from "../utils/util.js";
import bucketManager from "../database/bucketDB.js";

async function replaceAsync(str, regex, asyncFn) {
    const promises = [];
    
    str.replace(regex, (match, ...args) => {
      const promise = asyncFn(match, ...args);
      promises.push(promise);
      return match;
    });
    
    const data = await Promise.all(promises);
    
    return str.replace(regex, () => data.shift() || '');
}

async function getUserAvatarURL(userId, message, client) {
    return new Promise(async (resolve, reject) => {
      userId = userId?.toString();
      let user = client?.users?.cache?.get(userId);
      try {
        if (!user) user = await client?.users?.fetch(userId);
        let url = user?.avatarURL();
        if (!url) url = user?.defaultAvatarURL;
        resolve(url);
      } catch (e) {
        resolve(message.newavatarURL);
      }
    });
}

async function getMessage(serverId, channelId, msgId, client) {
    try {
      if (channelId && serverId && msgId) {
        channelId = channelId?.toString();
        let channel = client?.channels?.cache?.get(channelId);
  
        if (!channel) return null;
  
        let replyMsg;
        try {
          replyMsg = await channel?.messages?.fetch(msgId);
        } catch (e) {
          console.error(
            `Could not fetch the message with id ${msgId}. Error: ${e}`
          );
          return null;
        }
  
        let newReplyMsg = {
          authorId: replyMsg?.author ? replyMsg?.author?.id : null,
          authorName: replyMsg?.author ? replyMsg?.author?.username : null,
          content: replyMsg?.content,
        };
  
        let server = !!replyMsg?.guild
          ? replyMsg?.guild
          : client?.guilds?.cache?.get(serverId);
  
        if (!server) return null;
  
        replyMsg.content = await replaceAsync(
          replyMsg?.content,
          /<@(\d+)>/g,
          async (match, g1) => {
            let user = client?.users?.cache?.get(g1);
            if (!user) user = await client?.users?.fetch(g1);
            return '@' + user?.username;
          }
        );
        replyMsg.content = await replaceAsync(
          replyMsg?.content,
          /<#(\d+)>/g,
          async (match, g1) => {
            if (!!server) {
              let channel = server?.channels?.cache?.get(g1);
              if (!channel) channel = await server?.channels?.fetch(g1);
              return '#' + (channel?.name || '');
            } else {
              return '';
            }
          }
        );  
        replyMsg.content = await replaceAsync(
          replyMsg?.content,
          /<@&(\d+)>/g,
          async (match, g1) => {
            if (!!server) {
              let role = server?.roles?.cache?.get(g1);
              if (!role) role = await server?.roles?.fetch(g1);
              return '@' + (role?.name || '');
            } else {
              return '';
            }
          }
        );  
        return {
          content: newReplyMsg?.content,
          authorId: newReplyMsg?.authorId,
          authorName: newReplyMsg?.authorName,
        };
      }
    } catch (e) {
    }
}

const messageProcessor = async (m, serverId, client) => {
  return new Promise(async (resolve, rejects) => {
    try {
      
      if (!m) resolve(null);
      
      m.images = [];
      m.documents = [];
      m?.attachments?.forEach((a) => {
        const hasImageContentType =
          (a.contentType != null && a.contentType.startsWith('image')) ||
          (a.content_type != null && a.content_type.startsWith('image'));
        if (hasImageContentType) {
          m.images.push(a.url);
        } else {
          m.documents.push({
            filename: a.filename,
            url: a.url,
          });
        }
      });
      
      if (m?.author) {
        m.authorName = m?.author?.nickname;
        if (!m.authorName) m.authorName = m?.author?.username;
      }
      if (!m.authorName) {
        m.authorName = m?.newauthor?.username;
      }
      
      if (!!m.author) {
        if (m.authorId) {
          m.authorId = m.authorId;
        } else {
          m.authorId = m.author.id;
        }
      } else if (m.authorId) {
        m.authorId = m.authorId;
      }
      
      if (!!m.channel) {
        if (m?.channelId) {
          m.channelId = m?.channelId;
        } else {
          m.channelId = m?.channel.id;
        }
        m.channelName = m?.channel?.name;
      } else if (m?.channelId) {
        m.channelId = m?.channelId;
      } else {
        m.channelId = m?.channel_id;
      }
      
      let server = !!m.guild ? m.guild : client?.guilds?.cache?.get(serverId);
      m.guildId = server?.id;
      
      m.roleColor = !!m.member ? m?.member?.displayHexColor : 'null';
      if (m.roleColor == 'null' && !!server) {
        let member = server?.members?.cache?.get(m.authorId);
        try {
          if (!member) member = await server?.members?.fetch(m?.authorId);
          m.roleColor = member?.displayHexColor;
        } catch (e) {
        }
      }
      
      let replyMsg = m.message_reference ? m.message_reference : m.reference;
      if (replyMsg != undefined) {
        let fetchedMsg = await getMessage(
          serverId,
          replyMsg.channel_id || replyMsg.channelId,
          replyMsg.message_id || replyMsg.messageId,
          client
        );
        if (fetchedMsg === null) {
        } else {
          m.reply = fetchedMsg;
        }
      }
      
      m.reply = m.replyMessageObj;
      
      if (!m.createdTimestamp && m.timestamp)
        m.createdTimestamp = new Date(m?.timestamp).toString();
      if (typeof m.createdTimestamp == 'number')
        m.createdTimestamp = new Date(m?.createdTimestamp).toString();
      
      if (!m.avatarURL) m.avatarURL = await getUserAvatarURL(m.authorId, m, client);
      if (!m.avatarURL) {
        m.avatarURL = m.newavatarURL;
      }
      
      m.content = await replaceAsync(
        m?.content,
        /<@(\d+)>/g,
        async (match, g1) => {
          if (g1) {
            return '@' + (m?.newauthor?.username || ''); // Use empty string as default value if username is missing
          }
          return match; // Return the original match if g1 is falsy
        }
      ).catch(error => {
      });
      
      m.content = await replaceAsync(
        m.content,
        /<#(\d+)>/g,
        async (match, g1) => {
          if (g1) {
            if (!!server) {
              return '#' + (m?.newchannel?.name || ''); // Use empty string as default value if channel name is missing
            } else {
              return '';
            }
          }
          return match; // Return the original match if g1 is falsy
        }
      ).catch(error => {
      });
      
      m.content = await replaceAsync(
        m.content,
        /<@&(\d+)>/g,
        async (match, g1) => {
          if (g1) {
            if (!!server) {
              return '@'; // You may need to replace this with the actual role name
            } else {
              return '';
            }
          }
          return match; // Return the original match if g1 is falsy
        }
      ).catch(error => {
      });      
      
      if (!m.channelName) {
        m.channelName = m?.newchannel?.name;
      }
      
      resolve(m);
    } catch (e) {
      resolve('');
    }
  });
};

export const messageProcessorDriver = async (m, bucketId, client) => {
  const {serverId, channelId, memberId} = parseBucketId(bucketId);
  const processed_msg = await messageProcessor(m, serverId, client);
  console.log(`New Message on AAA Incubator from ${processed_msg.authorName} on channel ${processed_msg.channelName}`);
  if (processed_msg != null){
    await bucketManager.addMessage(bucketId, JSON.stringify(processed_msg, null, 2));
  }
  return processed_msg;
}