const JsonDB = require('node-json-db');

const DB = new JsonDB('conversations', true, false);
const stages = ['created', 'waiting'];

const find = (ts, parentTS) => {
  let conversation;
  try { conversation = DB.getData(`/${ts}`); } catch (error) {
    if (parentTS) {
      conversation = find(parentTS);
    } else { console.error(error); }
  }

  return conversation;
};

const findOrCreate = (ts, parentTS) => {
  let conversation = find(ts, parentTS);

  if (!conversation && !parentTS) {
    conversation = { ts, stage: 'initialize' };
    DB.push(`/${ts}`, conversation, false);
  }

  return conversation;
};

const nextStage = (ts) => {
  const conversation = find(ts);
  if (conversation) {
    const index = stages.indexOf(conversation.stage);
    conversation.stage = stages[index + 1];
  }

  return conversation;
};

module.exports = { findOrCreate, nextStage };
