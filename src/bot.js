const axios = require('axios');
const qs = require('querystring');
const agents = require('./agents.js');
const conversations = require('./conversations.js');

const firstMessage = (username, channelId) => {
  const message = {
    text: '',
    attachments: [
      {
        text: `<@${username}> Thanks for posting to <#${channelId}>. Do you need support from an agent in this channel?`,
        callback_id: 'initial_question',
        actions: [
          {
            name: 'yes',
            text: 'Yes',
            type: 'button',
            value: 'yes',
          },
          {
            name: 'no',
            text: 'No',
            type: 'button',
            value: 'no',
          },
        ],
      },
    ],
  };
  return message;
};

const sendMessage = (body, message) => {
  const defaults = { token: process.env.SLACK_BOT_TOKEN, link_names: true };
  const params = Object.assign({}, defaults, body, message);

  if (params.attachments) { params.attachments = JSON.stringify(params.attachments); }
  return axios.post('https://slack.com/api/chat.postMessage', qs.stringify(params));
};

const scan = (event) => {
  if (agents.memberOf(event.channel, event.user)) {
    console.log('Ignoring agent');
  } else {
    const conversation = conversations.findOrCreate(event.ts, event.thread_ts);
    if (conversation) {
      switch (conversation.stage) {
        case 'initialize': {
          const params = { channel: event.channel, thread_ts: event.ts };
          const message = firstMessage(event.user, event.channel);
          sendMessage(params, message).then((result) => {
            conversations.nextStage(event.ts);
            console.log(result);
          });

          break;
        }
        default: console.error('invalid stage');
      }
    }
  }
};

module.exports = { scan };
