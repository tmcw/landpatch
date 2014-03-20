var FeedParser = require('feedparser'),
    fs = require('fs'),
    queue = require('queue-async'),
    moment = require('moment'),
    request = require('request');

var options = {};

var req = request('https://landsat.usgs.gov/Landsat8.rss')
  , feedparser = new FeedParser([options]);

req.on('error', function (error) {
  // handle any request errors
});

req.on('response', function (res) {
  var stream = this;

  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

  stream.pipe(feedparser);
});


feedparser.on('error', function(error) {
  // always handle errors
});
var q = queue(1);
feedparser.on('readable', function() {
  // This is where the action is!
  var stream = this
    , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
    , item;

  while (item = stream.read()) {
    var date = moment(item.title.split(' at ')[1]).unix();
    var latlon = [item['geo:long']['#'], item['geo:lat']['#']].join('-');
    var slug = [date, latlon].join('-');
    var href = item.description.match(/href="([^"]+)/)[1];
    if (href && !fs.existsSync('cache/' + slug)) {
        q.defer(function(href, cb) {
            var r = request(href);
            r.pipe(fs.createWriteStream('cache/' + slug));
            r.on('end', function() {
                console.log('end');
                cb();
            });
        }, href);
    }
  }
});

