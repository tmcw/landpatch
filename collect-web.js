var FeedParser = require('feedparser'),
    fs = require('fs'),
    queue = require('queue-async'),
    im = require('imagemagick-stream'),
    moment = require('moment'),
    glob = require('glob'),
    split = require('split'),
    cheerio = require('cheerio'),
    concat = require('concat-stream'),
    request = require('request');

var q = queue(100);

var sofar = glob.sync('samples/*.jpg').join('');

fs.createReadStream('scenes-recursive')
    .pipe(split('\n'))
    .on('data', parse);

var lastReach = 'LC80440312013250LGN00';
var start = false;

var count = 0;

function parse(d) {
    if (d) {
        id = d.match(/([A-Z0-9]+).tar.bz$/);
        if (id[1] == lastReach) start = true;
        if (start && count % 16 === 0) {
            q.defer(dl, id[1]);
        }
        count++;
    }
}

function dl(id, callback) {
    console.log('loading', id);
    var url = 'http://earthexplorer.usgs.gov/form/metadatalookup/?collection_id=4923&entity_id={id}&pageView=1'
        .replace('{id}', id);
    try {
    request(url).pipe(concat(function(res) {
        var $ = cheerio.load(res.toString());
        var trs = $('table#metadataTable tr');
        var time = 0;
        var pos = [];

        trs.each(function() {
            var td = $(this).find('td');
            if ($(td[0]).text() == 'Start Time') {
                time = moment($(td[1]).text(), 'YYYY:DDD:HH:MM:').unix();
            }
            if ($(td[0]).text() == 'NW Corner Long dec') {
                pos[0] = +($(td[1]).text());
            }
            if ($(td[0]).text() == 'NW Corner Lat dec') {
                pos[1] = +($(td[1]).text());
            }
            if ($(td[0]).text() == 'SE Corner Long dec') {
                pos[2] = +($(td[1]).text());
            }
            if ($(td[0]).text() == 'SE Corner Lat dec') {
                pos[3] = +($(td[1]).text());
            }
        });

        var src = $('img#browse1').attr('src');

        if (pos.length == 4 && time && src) {
            try {
                var r = request(src);
                r.pipe(im().options({
                    transparent: 'black',
                    fuzz: '20%'
                })
                .resize('200x200'))
                    .pipe(fs.createWriteStream('samples/' + time + ',' + pos.join(',') + ',' + id + '.png'))
                r.on('end', callback);
            } catch(e) {
                callback();
            }
        } else {
            callback();
        }
    }));
    } catch(e) {
        callback();
    }
}
