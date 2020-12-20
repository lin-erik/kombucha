import { client } from './client/index.js';
import { MAIN_CHANNEL_ID, PIN_CHANNEL_ID, PIN_THROTTLE } from './constants.js';
import { db } from './database/index.js';

const pinMessage = async (message, user) => {
  try {
    const mainChannel = await client.channels.fetch(MAIN_CHANNEL_ID);
    const pinChannel = await client.channels.fetch(PIN_CHANNEL_ID);

    const alreadyPinned = await db.get(
      'SELECT pinned_id FROM Source_Map WHERE origin_id = ?',
      message.id
    );
    if (alreadyPinned) return;

    if (pinChannel.lastMessageID) {
      const lastMessage = await pinChannel.messages.fetch(
        pinChannel.lastMessageID
      );

      await throttle(lastMessage);
    }

    const pinnedMessage = await pinChannel.send(message.content || '', {
      embed: {
        description: `[Original Message](https://discord.com/channels/504427695057403935/${MAIN_CHANNEL_ID}/${message.id})`,
      },
      embeds: message.embeds,
      files: message.attachments.array(),
    });

    const announcementMessage = await mainChannel.send({
      embed: {
        description: `${user.username} just pinned [a message](${pinnedMessage.url}).`,
      },
    });

    await db.run(
      'INSERT INTO Source_Map (origin_id, pinned_id, announcement_id) VALUES (?, ?, ?)',
      [message.id, pinnedMessage.id, announcementMessage.id]
    );
  } catch (error) {
    console.log('There was a problem pinning the message', error);
  }
};

const removeMessage = async (message) => {
  try {
    const mainChannel = await client.channels.fetch(MAIN_CHANNEL_ID);
    const pinChannel = await client.channels.fetch(PIN_CHANNEL_ID);

    const { pinned_id, announcement_id } = await db.get(
      'SELECT * FROM Source_Map WHERE origin_id = ?',
      message.id
    );

    if (announcement_id) {
      await mainChannel.messages.delete(announcement_id);
    }

    if (pinned_id) {
      await pinChannel.messages.delete(pinned_id);
    }

    await db.run('DELETE FROM Source_Map WHERE origin_id = ?', message.id);
  } catch (error) {
    console.log('There was a problem unpinning the message', error);
  }
};

const throttle = async (lastMessage) => {
  const diff = new Date() - new Date(lastMessage.createdTimestamp);
  const inMinutes = Math.floor(diff / 1000 / 60);

  if (inMinutes < PIN_THROTTLE) await timeout((PIN_THROTTLE - inMinutes) * 60000);
}

const timeout = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export { pinMessage, removeMessage, timeout };
