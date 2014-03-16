var Canvas = require('canvas'),
    fs = require('fs'),
    glob = require('glob');

var c = new Canvas(1000, 500);
var ctx = c.getContext('2d');

ctx.translate(500, 250);
var scale = 500 / 180;

var drawn = 0;
var fnames = glob.sync('samples/*.png').
    map(function(fn) {
        var f = fn.split(',');
        // var im = new Canvas.Image();
        // im.src = fs.readFileSync(fn);
        var w = (f[3] - f[1]) * scale,
            h = (f[2] - f[4]) * scale;
        ctx.fillRect(~~(f[1] * scale), ~~(-f[2] * scale), ~~1, ~~1);
        // ctx.drawImage(im, ~~(f[1] * scale), ~~(-f[2] * scale), ~~w, ~~h);
        // console.log(++drawn, 'drawn');
    });

fs.writeFileSync('nullisland.png', c.toBuffer());
