express = require 'express'
index = require './routes/index.js'
http = require 'http'
exec = require 'child_process'
mkdirp = require 'mkdirp'
amqp = require 'AMQP-boilerplate'
path = require 'path'
ws = require 'nodejs-websocket'
uuid = require 'uuid'

name = 'api'
DataManager = 'datamanager'
users = []

app = express()

app.set 'port', 8080
app.set 'views', path.join __dirname, '../views'
app.set 'view engine', 'html'
app.use express.static path.join __dirname, '../public'

app.get '/', index.index

http.createServer(app).listen app.get('port'), () ->
    console.log 'Express server listening on port ' + app.get 'port'


server = ws.createServer (conn) ->

    console.log "New connection"

    id = uuid.v4()

    conn.on "text", (str) ->

        console.log "Received " + str

        try
            obj = JSON.parse str
            if obj.type is 'credential' then credential conn, obj

        catch e
            res =
                type: 'other'
            res.login = false
            res.message = "error on communication"
            conn.sendText JSON.stringify res

    conn.on "close", (code, reason) ->
        console.log "Connection closed"

.listen(8001)


credential = (conn, obj) ->

    res =
        type: 'credential'

    console.log obj

    if obj.user is "ali" and obj.pass is "alikh"
        token = uuid.v4()
        users.push token
        res.token = token
        res.login = true
    else
        res.login = false
        res.message = "wrong user or pass"

    conn.sendText JSON.stringify res