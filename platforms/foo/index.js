var fs = require('fs');
var path = require('path');
var express = require('express');
var body_parser = require('body-parser');

var mainServer = require('../..');

var platformScriptPath = mainServer.platformScriptPathTemplate.replace(':platform', 'foo') ;// = '/3rd/foo/platform.js';
var platformStylePath = mainServer.platformStylePathTemplate.replace(':platform', 'foo') ;// = mainServer.serverDirname+'/views/server/3rd/foo/platform.css';
var platformWidgetInitPath = mainServer.platformWidgetInitPathTemplate.replace(':platform', 'foo') ;// = '/3rd/foo/widget-init.html';

//Platform server
var platformApp = express();
platformApp.use(body_parser.json());

//respond to widget API
platformApp.get('/api/3rd/foo/widget/:id/init', function(req, res) {
    var id = req.params.id;
    var partyId = req.query.partyId;
    var isIframe = req.query.iframe === 'true';

    res.render('server'+platformWidgetInitPath, {
        id: id,
        partyId: partyId,
        serverHost: mainServer.serverHost,
        isIframe: isIframe,
    });
});

platformApp.post('/api/3rd/foo/widget/:id/:action', function(req, res) {
    var id = req.params.id;
    var action = req.params.action;
    var partyId = req.query.partyId;
    res.send({
        action: req.params.action,
        success: true, //In this demo, all actions succeed
        content: req.body,
    });
});

module.exports = platformApp;
