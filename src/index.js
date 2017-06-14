require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const agents = require('./agents.js');
const bot = require('./bot.js');

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/commands', (req, res) => {
  if (req.body.token === process.env.SLACK_VERIFICATION_TOKEN) {
    const values = req.body.text.split(' ');
    const re = /@(.*)\|/;
    const matches = values[1].match(re);
    if (matches) {
      switch (values[0]) {
        case 'add': agents.add(req.body.channel_id, matches[1]); break;
        case 'remove': agents.remove(req.body.channel_id, matches[1]); break;
        default: break;
      }
    }
    res.sendStatus(200);
  } else { res.sendStatus(500); }
});

app.post('/events', (req, res) => {
  switch (req.body.type) {
    case 'url_verification': {
      res.status(200).send({ challenge: req.body.challenge });
      break;
    }

    case 'event_callback': {
      if (req.body.token === process.env.SLACK_VERIFICATION_TOKEN) {
        res.send('');
        const event = req.body.event;
        if (event.type === 'message' && !event.subtype) {
          bot.scan(event);
        }
      } else { res.sendStatus(500); }
      break;
    }
    default: res.sendStatus(500);
  }
});

app.post('/interactive-message', (req, res) => {
  const body = JSON.parse(req.body.payload);
  if (body.token === process.env.SLACK_VERIFICATION_TOKEN) {
    switch (body.callback_id) {
      case '': { }
      default: { console.error('invalid callback_id'); }
    }
  }
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});
