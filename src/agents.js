const JsonDB = require('node-json-db');

const DB = new JsonDB('agents', true, false);

const add = (channelId, userId) => {
  let channel = false;
  try { channel = DB.getData(`/${channelId}`); } catch (error) {
    DB.push(`/${channelId}/agents[0]`, userId);
  }
  if (channel) {
    if (channel.agents.indexOf(userId) === -1) {
      DB.push(`/${channelId}/agents[]`, userId);
    }
  }
};

const remove = (channelId, userId) => {
  let channel = false;
  try { channel = DB.getData(`/${channelId}`); } catch (error) {
    console.error(error);
  }
  if (channel) {
    const index = channel.agents.indexOf(userId);
    if (index > -1) {
      DB.delete(`/${channelId}/agents[${index}]`);
    }
  }
};

const memberOf = (channelId, userId) => {
  let channel = false;
  try { channel = DB.getData(`/${channelId}`); } catch (error) {
    return false;
  }
  const index = channel.agents.indexOf(userId);
  return index > -1;
};

module.exports = { add, remove, memberOf };
