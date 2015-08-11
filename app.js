var express = require('express');
var routes = require('./routes');
var docconv = require('./routes/docconv');
var http = require('http');
var path = require('path');
var ws = require('nodejs-websocket');
var fs = require('fs');
var exec = require('child_process').exec;
var uuid = require('uuid');
var mkdirp = require('mkdirp');
var amqp = require('AMQP-boilerplate');

var name = 'api';
var DataManager = 'datamanager';


var app = express();

// all environments
app.set('port', 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
//app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/docconv', docconv.list);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
    
    
    amqp.Initialize(name, function (){
       
        amqp.Log("error","something","else"); 

        
        var message = {
            action: "retrieve",
            type: "user",
            payload: {
                username: "ali",
                password: "alikh"
            },
            responceNeeded: true
        }

        amqp.SendMessage(DataManager, message, new function(res) {
            console.log(res);
        });
    });

});


var server = ws.createServer(function (conn) {

    console.log("New connection");

    var id = uuid.v4();

    conn.on("text", function (str) {

        //console.log("Received " + str);
        try {

            var obj = JSON.parse(str);

            tempFolder = path.join(__dirname, 'public/temp/' + id);
            tempFolderShort = 'public/temp/' + id;

            pdfAddress = '/temp/' + id + '/document.pdf';
            fileAddress = '/temp/' + id + '/file.';


            mkdirp(tempFolder, function(err) { 

                if(err) {
                    return console.log(err);
                }

                fs.writeFile(tempFolder + "/test.tmp", obj.body, function (err) {
                    if (err) {
                        return console.log(err);
                    }

                    if(obj.getPdf) {
                        var cmd = 'pandoc -f ' + obj.from + ' -t latex' + ' -s ' + tempFolder + '/test.tmp' + ' -o ' + tempFolder + '/document.pdf';
                    }
                    else {
                        var cmd = 'pandoc -f ' + obj.from + ' -t ' + obj.to + ' -s ' + tempFolder + '/test.tmp' + ' -o ' + tempFolder + '/file.' + obj.to;
                    }
                    
                    
                    console.log(cmd);
                    var child = exec(cmd);

                    
                    
                    child.on('exit', function () {

                        if(obj.getPdf) {
                            var res = {
                                type: 'pdf',
                                link: pdfAddress
                            }
                            conn.sendText(JSON.stringify(res));
                        }
                        else {
                            fs.readFile(tempFolder + "/file." + obj.to, 'utf8', function (err, data) {
                                if (err) {
                                    return console.log(err);
                                }
                                
                                
                                    var res = {
                                        type: 'responce',
                                        link: fileAddress + obj.to,
                                        content: data
                                    }
                                    conn.sendText(JSON.stringify(res));                                
                            });
                        }
                    
                    });
                });

            });

        } catch (e) {

            conn.sendText(e.message);
        }
    });
    conn.on("close", function(code, reason) {
        console.log("Connection closed");
    });
}).listen(8001)