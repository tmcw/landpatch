var scale = 2;
var width = scale * 1000, height = scale * 500;
var c = document.getElementById('c');
var c2 = document.getElementById('c2');
var dateDiv = document.getElementById('date');
var sz = 50;

files = files.filter(function(f) {
    var loc = f.split('/')[1].split(',');
    var pos = [+loc[1], +loc[2]];
    var rpos = [+loc[3], +loc[4]];
    return pos[0] < -30 && pos[1] > -30;
});

console.log(files.length, 'files in loop');

c.width = width;
c.height = height;

c2.width = width;
c2.height = height;

var ctx = c.getContext('2d');

var ctx2 = c2.getContext('2d');

function proj(xy) {
    return [
        ((xy[0] + 130) / 100) * width,
        ((70 - xy[1]) / 60) * height
    ];
}

var sample = document.getElementById('sample');
var latlondiv = document.getElementById('latlon');
var i = 0;

ctx.fillStyle = '#000';

function grab() {
    if (++i > files.length - 1) i = 0;
    var f = files[i];
    var loc = f.split('/')[1].split(',');
    var date = new Date(+loc[0] * 1000);
    var pos = [+loc[1], +loc[2]];
    var rpos = [+loc[3], +loc[4]];
    var p = proj(pos);
    var p2 = proj(rpos);
    var w = (p2[0] - p[0]) + 8;
    var h = (p2[1] - p[1]) + 8;
    dateDiv.innerHTML = moment(date).format('YYYY-MM-D');
    latlondiv.innerHTML = pos[0].toFixed(2) + ', ' + pos[1].toFixed(2);
    sample.onerror = function() {
        im = null;
        setTimeout(grab, 1 * 10);
    };
    sample.onload = function() {
        ctx.drawImage(this, ~~p[0], ~~p[1], ~~w, ~~h);
        c2.width = width;
        ctx2.strokeStyle = 'yellow';
        ctx2.lineWidth = 1;
        ctx2.beginPath();
        ctx2.rect(~~p[0], ~~p[1], ~~w, ~~h);

        function mt(x, y) {
            ctx2.moveTo(~~x, ~~y);
        }

        function lt(x, y) {
            ctx2.lineTo(~~x, ~~y);
        }

        mt(p[0], p[1] + h/2);
        lt(p[0] - 10, p[1] + h/2);

        mt(p[0] + w, p[1] + h/2);
        lt(p[0] + w + 10, p[1] + h/2);

        mt(p[0] + w/2, p[1]);
        lt(p[0] + w/2, p[1] - 10);

        mt(p[0] + w/2, p[1] + h);
        lt(p[0] + w/2, p[1] + h + 10);

        ctx2.stroke();
        setTimeout(grab, 1 * 500);
    };
    sample.src = f;
}

grab();
