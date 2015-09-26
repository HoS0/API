express             = require 'express'
index               = require './routes/index.js'
http                = require 'http'
amqp                = require 'AMQP-boilerplate'
path                = require 'path'
WebSocketManager    = require './WebSocketManager'
bodyParser          = require 'body-parser'
moment              = require 'moment'

app = express()

name = 'administrationapi'

log = (severity, msg, stack) ->
    amqp.Log severity, msg, stack
    console.log "--- loging --- " + severity + ": " + msg

app.set 'port', 8080
app.set 'views', path.join __dirname, '../views'
app.set 'view engine', 'html'
app.use express.static path.join __dirname, '../public'
app.use bodyParser.json()
app.use bodyParser.urlencoded
  extended: true


app.get '/', index.index
app.post '/main', index.main

http.createServer(app).listen app.get('port'), () ->
    console.log 'Express server listening on port ' + app.get 'port'

amqp.Initialize name, () ->
    amqp.CreateRequestQueue name, (message) ->
        log "info",  neme + " service has started working.", ""
    
    WebSocketManager.init amqp 
    index.init WebSocketManager 