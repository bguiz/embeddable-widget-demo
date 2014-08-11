var http = require('http');
var express = require('express');
var os = require( 'os' );
var ejs = require('ejs');

var serverPort = process.env.SERVER_PORT || 54100;
var clientPort = process.env.CLIENT_PORT || 54101;

var networkInterfaces = os.networkInterfaces( );

function getIpAddress() {
    var keys = Object.keys(networkInterfaces);
    for (var x = 0; x < keys.length; ++x) {
        var netIf = networkInterfaces[keys[x]];
        for (var y = 0; y < netIf.length; ++ y) {
            var addr = netIf[y];
            if (addr.family === 'IPv4' && !addr.internal) {
                return addr.address;
            }
        }
    }
    return '127.0.0.1';
}

var serverHost = '//'+getIpAddress()+':'+serverPort;
var platformScript = '/3rd/platform.js';

//Platform server
var serverApp = express();

//enable CORS
serverApp.use(function(req, res, next) {
    console.log('cors middleware');
    //only for paths that come under /api/3rd
    if ((/^\/api\/3rd\/.+$/).test(req.path)) {
        //TODO if more security is required, perhaps ask each user to login to
        //an admin panel and white list the domains that they would like to embed these widgets on
        //Then test here that the domain matches
        var corsOrigin = req.headers.origin;
        var corsMethod = req.headers['access-control-request-method'];
        var corsHeaders = req.headers['access-control-request-headers'];
        var hasACorsFlag = corsOrigin || corsMethod || corsHeaders;
        //console.log('cors middleware xhr', hasACorsFlag, corsOrigin, corsMethod, corsHeaders);
        if (hasACorsFlag) {
            res.header('Access-Control-Allow-Origin', corsOrigin);
            res.header('Access-Control-Allow-Methods', corsMethod);
            res.header('Access-Control-Allow-Headers', corsHeaders);
            res.header('Access-Control-Max-Age', 60 * 60 * 24);
            if (req.method === 'OPTIONS') {
                res.send(200);
                return;
            }
        }
    }
    next();
});

//serve platform script file
serverApp.engine('js', ejs.renderFile);
serverApp.get(platformScript, function(req, res) {
    res.render('server'+platformScript, {
        serverHost: serverHost,
        platformScript: platformScript,
    });
});

//responde to widget API
serverApp.get('/api/3rd/foo-widget/init/:id', function(req, res) {
    var id = req.params.id;
    res.send('api response #'+id);
});
serverApp.use(express.static('server'));

//3rd party using widgets served by platform server
var clientApp = express();
clientApp.set('view engine', 'html');
clientApp.engine('html', ejs.renderFile);
clientApp.get('/', function(req, res) {
    res.render('client/index', {
        serverHost: serverHost,
        platformScript: platformScript,
    });
});

http.createServer(serverApp).listen(serverPort);
http.createServer(clientApp).listen(clientPort);
