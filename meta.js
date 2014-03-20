var glob = require('glob'), fs = require('fs');


fs.writeFileSync('files.js', 'files = ' + JSON.stringify(glob.sync('samples/*.png').sort(function(a, b) {
    return (+a.split(',')) - (+b.split(','));
})));
