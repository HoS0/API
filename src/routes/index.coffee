path = require 'path'

exports.index = (req, res) ->
    
    res.sendfile path.join __dirname,'../../views/login.html'
