express             = require 'express'
index               = require './routes/index.js'
http                = require 'http'
amqp                = require 'AMQP-boilerplate'
path                = require 'path'
bodyParser          = require 'body-parser'
moment              = require 'moment'
ws                  = require 'nodejs-websocket'
uuid                = require 'uuid'

name = 'api'
DataManager = 'datamanager'

amqp.Initialize name, () ->
    amqp.CreateRequestQueue name, (message) ->
        parseMessage message
        
    app = express()

    app.set 'port', 8080
    app.set 'views', path.join __dirname, '../views'
    app.set 'view engine', 'html'
    app.use express.static path.join __dirname, '../public'
    app.use bodyParser.json()
    app.use bodyParser.urlencoded
      extended: true

    generic = (req, res) ->

        console.log req.body

        service = req.originalUrl.substring(1)
        console.log service

        amqp.SendMessage service, req.body, (amqpRes) ->
            console.log amqpRes
            res.send JSON.stringify amqpRes

    app.get '/', index.index
    app.get '*', generic

    http.createServer(app).listen app.get('port'), () ->
        console.log 'Express server listening on port ' + app.get 'port'


    server = ws.createServer (conn) ->
        try
            console.log "New connection"
            id = uuid.v4()

            conn.on "text", (str) ->
                try
                    obj = JSON.parse str

                    amqp.SendMessage obj.to, obj, (amqpRes) ->
                        console.log amqpRes
                        onn.sendText JSON.stringify amqpRes

                catch e
                    res =
                        type: 'other'
                    res.message = "error on communication"
                    conn.sendText JSON.stringify res

            conn.on "close", (code, reason) ->
                console.log "Connection closed"

        catch
            console.log "error on make a connection"

    .listen(8001)
