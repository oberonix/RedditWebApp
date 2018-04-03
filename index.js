const express = require('express');
const request = require('request');
const config = require('./config');

const app = express();

app.listen(config.port, () => {
  process.stdout.write(`Server started at: http://localhost:${config.port}\n`);
});


app.use('/reddit/:subRedditName', (req, res) => {
  const subRedditName = req.params.subRedditName;
  let query;
  if(req.query.before) {
    query = `?before=${req.query.before}`;
  } else if(req.query.after) {
    query = `?after=${req.query.after}`;
  }
  if(query && req.query.count) {
    query = `${query}&count=${req.query.count}`;
  }
  request(`http://www.reddit.com/r/${subRedditName}.json${query || ''}`, function (error, response, body) {
    if(error) {
      return res.status(500).send('Internal server error');
    }
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(body);
    } catch(e) {
      return res.status(500).send('Internal server error');
    }

    //quick pass to minimize and normalize data
    let formattedResponse = {
      after: parsedResponse.data.after,
      before: parsedResponse.data.before,
      posts: parsedResponse.data.children.map((post) => {
        let thumbnail = post.data.thumbnail;
        if(thumbnail.indexOf('http') !== 0) {
          thumbnail = null;
        }
        return {
          title: post.data.title,
          author: post.data.author,
          thumbnail: thumbnail,
          //reddit returns dates in seconds
          created: post.data.created * 1000,
          ups: post.data.ups,
          url: post.data.url
        }
      })
    }
    return res.json(formattedResponse);
  });
});

app.use('/', express.static('public', {
  index: 'index.html'
}));
