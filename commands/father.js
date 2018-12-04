module.exports = {
  name: 'father',
  description: 'The father',
  execute(message, args) {
    setTimeout(() => {
      message.channel.send('Erik');
    }, 2000);
  }
};
