var fs = require('fs');
var queue = require('queue-async');
require('./subset');

var q = queue(10);

files.forEach(function(s) {
    q.defer(function(callback) {
        var read = fs.createReadStream(s);
        read.on('end', callback);
        read.pipe(fs.createWriteStream(s.replace('samples/', 'subset/')));
    });
});
