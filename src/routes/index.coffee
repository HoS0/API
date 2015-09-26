path        = require 'path'
geoip       = require('geoip-lite');
websocket   = null

exports.init = (ws) ->
    websocket = ws


exports.main = (req, res) ->
    if websocket
        if req.body and req.body.token and websocket.validateToken req.body.token
            res.sendfile path.join __dirname,'../../views/TaskManager.html'
        else
            res.sendfile path.join __dirname,'../../views/login.html'

exports.index = (req, res) ->
    if websocket
        if req.body and req.body.token and websocket.validateToken req.body.token
            res.sendfile path.join __dirname,'../../views/TaskManager.html'
        else
            res.sendfile path.join __dirname,'../../views/login.html'
