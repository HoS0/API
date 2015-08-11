




var geoip = require('geoip-lite');
var path = require('path');

exports.list = function (req, res) {
    
    var date = new Date();

    console.log(date);

    var ipadd = req.connection.remoteAddress;
    ipadd = ipadd.replace('::ffff:', '');
   
    var geo = geoip.lookup(ipadd);


    console.log(req.headers);
    console.log(ipadd);
    console.log(geo);

    res.sendfile(path.join(__dirname,'../views/textconvert.html'));
};