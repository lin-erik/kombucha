import { client } from './client/index.js';
import { PIN_EMOJI } from './constants.js';
import { pinMessage, removeMessage } from './helpers.js';

client.once('ready', async () => {
  console.log('Kombucha is now running!');

  setInterval(() => console.log("Kombucha heartbeat"), 300000);
});

client.on('messageReactionAdd', async (message, user) => {
  console.log('messageReactionAdd event triggered');
  
  try {
    if (message.partial) {
      console.log('Fetching uncached reaction');
      await message.fetch();
    }

    if (message._emoji.name !== PIN_EMOJI) return;
  } catch (error) {
    return console.log('There was a problem fetching the reaction', error);
  }

  const reactions = message.message.reactions.cache.get(PIN_EMOJI);
  if (reactions.count > 1) {
    return message.users.remove(user);
  }

  await pinMessage(message.message, user);
});

client.on('messageReactionRemove', async (message, user) => {
  console.log('messageReactionRemove event triggered');

  try {
    if (message.partial) {
      console.log('Fetching uncached reaction');
      await message.fetch();
    }

    if (message._emoji.name !== PIN_EMOJI) return;
  } catch (error) {
    return console.log('There was a problem fetching the reaction', error);
  }

  await removeMessage(message.message, user);
});

client.login(process.env.DISCORD_TOKEN);
