ws                  = require 'nodejs-websocket'
uuid                = require 'uuid'

users = []

RabbitMQDataManager = null

exports.init = (rabbitMQDataManager) ->

    RabbitMQDataManager = rabbitMQDataManager

    server = ws.createServer (conn) ->

        try

            console.log "New connection"

            id = uuid.v4()

            conn.on "text", (str) ->

                console.log "Received " + str

                try
                    obj = JSON.parse str
                    

                catch e
                    res =
                        type: 'other'
                    res.login = false
                    res.message = "error on communication"
                    conn.sendText JSON.stringify res

            conn.on "close", (code, reason) ->
                console.log "Connection closed"

        catch
            console.log "error on make a connection"

    .listen(8001)


