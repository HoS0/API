path        = require 'path'
geoip       = require('geoip-lite');
websocket   = null

exports.init = (ws) ->
    websocket = ws

exports.index = (req, res) ->    
    res.sendfile path.join __dirname,'../../views/login.html'

exports.main = (req, res) ->
    geo = geoip.lookup(req.connection.remoteAddress);
    console.log(geo);
    if websocket and req.body and req.body.token
        if websocket.validateToken req.body.token
            res.sendfile path.join __dirname,'../../views/index.html'
        else
            res.sendfile path.join __dirname,'../../views/login.html'

exports.NotificationUsers = (req, res) ->
    geo = geoip.lookup(req.connection.remoteAddress);
    console.log(geo);
    if websocket and req.body and req.body.token
        if websocket.validateToken req.body.token
            res.sendfile path.join __dirname,'../../views/NotificationUsers.html'
        else
            res.sendfile path.join __dirname,'../../views/login.html'


exports.UserVersionDistribution = (req, res) ->
    if websocket and req.body and req.body.token
        if websocket.validateToken req.body.token
            res.sendfile path.join __dirname,'../../views/UserVersionDistribution.html'
        else
            res.sendfile path.join __dirname,'../../views/login.html'

exports.RegisteredUsers = (req, res) ->
    if websocket and req.body and req.body.token
        if websocket.validateToken req.body.token
            res.sendfile path.join __dirname,'../../views/RegisteredUsers.html'
        else
            res.sendfile path.join __dirname,'../../views/login.html'


exports.TaskManager = (req, res) ->
    if websocket and req.body and req.body.token
        if websocket.validateToken req.body.token
            res.sendfile path.join __dirname,'../../views/TaskManager.html'
        else
            res.sendfile path.join __dirname,'../../views/login.html'


exports.PaidUsers = (req, res) ->
    if websocket and req.body and req.body.token
        if websocket.validateToken req.body.token
            res.sendfile path.join __dirname,'../../views/PaidUsers.html'
        else
            res.sendfile path.join __dirname,'../../views/login.html'

exports.tt = (req, res) ->
    res.sendfile path.join __dirname,'../../views/index.html'

