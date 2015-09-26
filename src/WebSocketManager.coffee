ws                  = require 'nodejs-websocket'
uuid                = require 'uuid'

users = []

RabbitMQDataManager = null
Amqp = null


exports.init = (amqp) ->
    Amqp = amqp
    clients = []

    server = ws.createServer (conn) ->

        try
            clients.push(conn);

            console.log "New connection"

            id = uuid.v4()
            conn.on "text", (str) ->

                try
                    obj = JSON.parse str

                    switch obj.type
                        when 'credential'           then credential conn, obj
                        when 'token'                then token conn, obj
                        when 'chat'                 then chat conn, obj
                        else
                            generic conn, obj

                catch e
                    res =
                        type: 'other'
                    res.login = false
                    res.message = "error on communication"
                    
                    try
                        conn.sendText JSON.stringify res
                    catch e
                        #ignore

            conn.on "close", (code, reason) ->

                for i in [0 .. clients.length]
                    if clients[i] is conn 
                        clients.splice(i)
                        break;

                console.log "Connection closed"

        catch
            console.log "error on make a connection"

    .listen(8001)


    generic = (conn, obj) ->

        if obj.to
            if obj.action isnt "kill"
                obj.responceNeeded = true
                
            Amqp.SendMessage obj.to, obj, (amqpRes) ->
                if(amqpRes.broadcast)
                    for i in [0 .. clients.length]
                        try
                            clients[i].sendText JSON.stringify amqpRes
                        catch e
                            #ignore
                else
                    try
                        conn.sendText JSON.stringify amqpRes
                    catch e
                        #ignore


    credential = (conn, obj) ->
        res =
            type: 'credential'

        console.log obj

        if ((obj.user is "ali" or obj.user is "michele") and (obj.pass is "alikh"))
            token = uuid.v4()
            users.push {token:token , user: obj.user}
            res.token = token
            res.login = true
        else
            res.login = false
            res.message = "wrong user or pass"

        try
            conn.sendText JSON.stringify res
        catch e
            #ignore

    token = (conn, obj) ->
        res =
            type: 'token'
            token: obj.token

        console.log obj

        for user in users
            if(user.token is obj.token)
                res.accepted = true

        try
            conn.sendText JSON.stringify res
        catch e
            #ignore

    chat = (conn, obj) ->
        for user in users
            if(user.token is obj.payload.token)
                obj.payload.person = user.user
        
        generic conn, obj
        

exports.validateToken = (token) ->
    for user in users
        if(user.token is token)
            return true

    return false