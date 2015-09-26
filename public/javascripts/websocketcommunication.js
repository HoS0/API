WEB_SOCKET_SWF_LOCATION = "WebSocketMain.swf";
WEB_SOCKET_DEBUG = true;

var recentData = null;
var baseUrl = 'localhost';
var ws;
var doughnutData = [];

var token = '';
var pie = null;
var lineChart = null;

var cookies = document.cookie.split(';');
var datamanager = 'datamanager'


var lineChartData = {
    labels : [],
    datasets : [
        {
            label: "Online user in last 24hours",
            fillColor : "rgba(151,187,205,0.2)",
            strokeColor : "rgba(151,187,205,1)",
            pointColor : "rgba(151,187,205,1)",
            pointStrokeColor : "#fff",
            pointHighlightFill : "#fff",
            pointHighlightStroke : "rgba(151,187,205,1)",
            data : []
        },
        {
            label: "Online user in last 24hours",
            fillColor : "rgba(151,107,105,0.2)",
            strokeColor : "rgba(151,107,105,1)",
            pointColor : "rgba(151,107,105,1)",
            pointStrokeColor : "#fff",
            pointHighlightFill : "#fff",
            pointHighlightStroke : "rgba(151,107,105,1)",
            data : []
        }
    ]
}

var sendRequest = function () {

    var msgToSend = {};
    if(type === "TaskManager") {
        msgToSend = {
            to: "taskManager",
            type: "HOSProcess",
            action: "retrieve",
        };    
    }
    else {
        msgToSend = {
            to: "ZettaboxDataAnalyze",
            type: type,
            action: "retrieve",
        };    
    }

    if(type === "token")
        msgToSend.token = token;

    var stringified = JSON.stringify(msgToSend);
    ws.send(stringified);
}



function getRandomColor() {

    var letters = '0123456789ABCDEF'.split('');
    var ret = {};
    var color = '#';
    var color1 = '#';
    for (var i = 0; i < 6; i++ ) {

        var num = Math.floor(Math.random() * 14);
        color += letters[num];
        color1 += letters[num+2];
    }
    ret.color = color;
    ret.colorH = color1;
    return ret;
}

function OnMessageSendClicked() {

    var input = document.getElementById("btn-input");

    var payload = {
        data: input.value,
        token: token
    };

    msgToSend = {
        to: datamanager,
        type: "chat",
        action: "create",
        broadcast: true,
        payload: payload
    }

    var stringified = JSON.stringify(msgToSend);
    ws.send(stringified);

    input.value = ""
}

function compareProviders(a,b) {

    if (a.num > b.num)
        return -1;

    if (a.num < b.num)
        return 1;

    return 0;
}

function compareVersionReport(a,b) {

    if (a.Summ > b.Summ)
        return -1;

    if (a.Summ < b.Summ)
        return 1;

    return 0;
}

function processPeoviderStatics(res) {

    doughnutData = [];

    var content = ""
    var total = 0;
    var count = 0;

    console.log(res);

    res.payload.providers.sort(compareProviders);    
    res.payload.providers.forEach(function(pro) {

        color = colorCollection[count].color;
        colorH = colorCollection[count].colorH;
        count += 1;

        var p = {
            value: pro.num,
            color: color,
            highlight: colorH,
            label: pro.name
        };

        total += pro.num;
        doughnutData.push(p);
    });

    res.payload.queues.forEach(function(q) {

        q.name = q.name.substr(0, q.name.indexOf("."));
        content += '<tr><td>' + q.fname + '</td><td>' + q.lname + '</td><td>' + q.email + '</td><td>' + q.name + '</td></tr>';
    });

    $('#chart').html('');
    $('#chart').append('<canvas id="chart-area" width="500" height="500"></canvas>');

    var ctx = document.getElementById("chart-area").getContext("2d");

    if(pie !== null)
        pie.destroy();

    var optionsNoAnimation = {animation : false}
    var myNewChart = new Chart(ctx);
    pie = myNewChart.Doughnut(doughnutData, {responsive : true, animation: false});
    
    $('#here_table').html('');
    $('#here_table').append(content);


    var msg = document.getElementById("total-users");
    if(msg)
        msg.innerHTML = 'Total number: ' + total;

    $('#dataTables-example').DataTable({
            responsive: true
    });
}

function processDailyReportNotify(res) {

    recentData = res;

    lineChartData.labels = [];
    lineChartData.datasets[0].data = [];
    lineChartData.datasets[1].data = [];

    var total = 0;
    var count = 0;

    res.payload.forEach(function(pro) {
      if(pro){
        var a = pro.createdAt.substring(11, 16) + "GMT";
        lineChartData.labels.push(a);
        lineChartData.datasets[0].data.push(pro.numberOfQueue);  

        $('#providerSelect').html('');

        pro.providers.forEach(function (p) {
            $('#providerSelect').append('<option value="' + p.name + '">' + p.name + '</option>');
        });
      }
    });

    var ctx = document.getElementById("canvas").getContext("2d");

    if(lineChart !== null)
       lineChart.destroy();

    var optionsNoAnimation = {animation : false}
    var myNewChart = new Chart(ctx);
    lineChart = myNewChart.Line(lineChartData, {responsive : true, animation: false});

    getval(null);
}

function GetServiceInfoCliecked(service) {
    ws.send(JSON.stringify({
        to: service,
        action: "whoru"
    }));
}

function KillClicked(service) {

    console.log(service);

    ws.send(JSON.stringify({
        to: service,
        action: "kill"
    }));
}

function RunClicked(id) {
    var pathInput = document.getElementById("taskCommand");
    var workingDir = document.getElementById("workingDirectory");
    command = pathInput.value.split(" ");
    var app = command.slice(0, 1);
    var args = command.slice(1, command.length);

    msgToSend = {
        to: "taskManager." + id,
        action: "create",
        payload: {
            serviceName: app,
            servicePath: "",
            action: "start",
            startDate: Date.now(),
            args: args
        }
    }

    if(workingDir.value && workingDir.value != "")
        msgToSend.payload.cwd = workingDir.value;


    if(pathInput.value != "" && pathInput.value != null)
        msgToSend.payload.path = pathInput.value

    ws.send(JSON.stringify(msgToSend));  
}

function RunTaskCliecked(id) {
    content = "";

    content = '<div class="panel-body">' +
    '<div class="row">' +
    '<div class="col-lg-12">' +
    '<form role="form">' +
    '<div class="form-group">' +
    '<label>command</label>' +
    '<input class="form-control" id="taskCommand" placeholder="example: `ping google.com`">' +
    '<label>working directory</label>' +
    '<input class="form-control" id="workingDirectory" placeholder="example: `c:\\temp`">' +
    '</div>' +
    '<div class="form-group">' +
    '<button class="btn btn-danger" type="button"  style="margin-left:.5em" onclick="RunClicked(\'' + id + '\');">Run</button>' +
    '</div>' +
    '<div class="form-group">' +
    "<pre id='TerminalView'></pre>";
    '</div>' +
    '</form></div></div></div>';

    $('#myModalLabel').html("TaskManager." + id + '</h4>');
    $('#whoami-body').html(content);    
    $('#myModal').modal('show');

    loggerInterval = setInterval(function() {GetLogCliecked("taskManager." + id);}, 1000);
}

function sendCleanupMessage(id, action) {
    var pathInput = document.getElementById("cleanUpFolderPath");

    msgToSend = {
        to: "CleanupService." + id,
        action: "create",
        payload: {
            action: action
        }
    }

    if(pathInput.value != "" && pathInput.value != null)
        msgToSend.payload.path = pathInput.value

    ws.send(JSON.stringify(msgToSend));    
}


function RemoveMarkedForDeletedFilesCliecked(id) {
    sendCleanupMessage(id, "cleanMarkForDelete");
}

function RemoveTempFiles(id) {
    sendCleanupMessage(id, "cleanTemp");
}

function CleanFolderCliecked(id) {
    sendCleanupMessage(id, "clean");
}

var loggerInterval = null;
function RunCleanupPageCliecked(id) {

    content = "";

    content = '<div class="panel-body">' +
    '<div class="row">' +
    '<div class="col-lg-12">' +
    '<form role="form">' +
    '<div class="form-group">' +
    '<label>Zettabox Storage Folder Location</label>' +
    '<input class="form-control" id="cleanUpFolderPath" placeholder="example: `c:\\ZettaboxStorage`">' +
    '</div>' +
    '<div class="form-group">' +
    '<button class="btn btn-danger" type="button"  style="margin-left:.5em" onclick="CleanFolderCliecked(\'' + id + '\');">Clean Folder</button>' +
    '<button class="btn btn-danger" type="button"  style="margin-left:.5em" onclick="RemoveMarkedForDeletedFilesCliecked(\'' + id + '\');" >Remove Marked For Deleted Files</button>' +
    '<button class="btn btn-danger" type="button"  style="margin-left:.5em" onclick="RemoveTempFiles(\'' + id + '\');" >Remove `_temp` files</button>' +
    '</div>' +
    '<div class="form-group">' +
    "<pre id='TerminalView'></pre>";
    '</div>' +
    '</form></div></div></div>';

    $('#myModalLabel').html("Cleanup." + id + '</h4>');
    $('#whoami-body').html(content);
    $('#myModal').modal('show');

    
    loggerInterval = setInterval(function() {GetLogCliecked("CleanupService." + id);}, 1000);
}

function processLogger(res) {
    content = "";

    content += '<div class="table-responsive"><table class="table"><thead><tr><th>service</th>'
    content += '<th>service id</th><th>time</th><th>severity</th><th>message</th></tr></thead><tbody>'


    var rowContent = "";

    commands = res.payload.slice(0,15)
    commands = commands.reverse();

    res.payload.forEach( function (log) {

        content += '<tr><td>' + log.service + '</td><td>' + log.serviceId + '</td><td>' + log.createdAt + '</td><td>' + log.severity + '</td><td>' + log.message + '</td></tr>';
    })

    commands.forEach( function (log) {

        rowContent += log.message + '<br/>';
    })

    content += '</tbody></table></div>'

    var TerminalView = document.getElementById("TerminalView");
    if(TerminalView) {

        TerminalView.innerHTML = rowContent;

        if(!$('#myModal').hasClass('in')  && loggerInterval) {
            clearInterval(loggerInterval);
            loggerInterval = null;    
            $('#myModalLabel').html('');
            $('#whoami-body').html('');
        }
    }
    
    else {
        $('#myModalLabel').html("Log Information" + '</h4>');
        $('#whoami-body').html(content);
        console.log(res);
        $('#myModal').modal('show');
    }
}

function processWhoami (res) {

    content = "";

    content += '<div><p><strong>RAM availability</strong><span class="pull-right text-muted"> ' + (res.payload.totalmem - res.payload.freemem) / 1048576 + ' MB out of ' + res.payload.totalmem / 1048576 + ' MB</span></p>';
    content += '<div class="progress progress-striped active">';
    content += '<div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="' + (res.payload.totalmem - res.payload.freemem) * 100 / res.payload.totalmem + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + (res.payload.totalmem - res.payload.freemem) * 100 / res.payload.totalmem + '%">';
    content += '<span class="sr-only"></span></div></div></div>';

    content += "<li>System architecture: " +res.payload.arch + "</li>";
    content += "<li>Host computer name: " +res.payload.host + "</li>";
    content += "<li>platform: " +res.payload.platform + "</li>";
    content += "<li>OS: " +res.payload.os + "</li>";

    // content += "<li>Free Memory: " +res.payload.freemem + "</li>";
    // content += "<li>Total Memory: " +res.payload.totalmem + "</li>";
    content += "<li>Up Time: " +res.payload.uptime / 3600 + " hours</li>";
    content += "<li>network: <pre >" + JSON.stringify(res.payload.network, undefined, 2) + "</pre></li>";


    $('#myModalLabel').html(res.to + '</h4>');
    $('#whoami-body').html(content);
    console.log(res);
    $('#myModal').modal('show');
}

function GetLogCliecked(service) {
    msgToSend = {
        to: "logger",
        type: "logger",
        responceNeeded: true,
        action: "retrieve",
        payload: {
            type: "getByService",
            value: service
        }
    }

    ws.send(JSON.stringify(msgToSend));
}


function processHOSProcess(res) {

    var content = ""

    var total = 0;
    $('#Exchange_table').html('');

    res.payload.services.forEach(function(pro) {
        total += 1;
        content += '<tr><td>' + pro.name + " on " + pro.host + '</td><td>' + pro.id + '</td><td>' 
            + '<button type="button" onclick="GetServiceInfoCliecked(\'' + pro.name  + "." + pro.id + '\');" class="btn btn-primary">Get Info</button>';

        if(pro.name === "taskManager")
            content += '<button type="button" onclick="RunTaskCliecked(\'' + pro.id + '\');" class="btn btn-warning">Run sub task</button>';

        if(pro.name === "CleanupService")
            content += '<button type="button" onclick="RunCleanupPageCliecked(\'' + pro.id + '\');" class="btn btn-warning">Cleanup page</button>';

        content += '<button type="button" onclick="GetLogCliecked(\'' + pro.name  + "." + pro.id + '\');" class="btn btn-warning">Get Log</button>';
        
        content += '<button type="button" onclick="KillClicked(\'' + pro.name  + "." + pro.id + '\');" class="btn btn-danger">Kill</button>';

        content +='</td></tr>';
    });

    $('#Exchange_table').append(content);

    // $('#dataTables-example').DataTable({
    //     responsive: true
    // });

    $('#ServicessPanel').html('');

    res.payload.taskExchanges.forEach(function(ser) {

        var content = '<div class="col-lg-4 col-md-6">' +
        '<div class="panel panel-green">' +
        '<div class="panel-heading">' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '<i class="fa fa-tasks fa-5x"></i></div>' +
        '<div class="col-xs-9 text-right">' +
        '<div class="huge">' + ser.numInstance + '</div>' +
        '<div>Running Instance</div></div></div></div>' +
        '<div class="panel-footer">' +
        '<span class="pull-left">' + ser.name + '</span>' +
        '<span class="pull-right">' + '<button type="button" onclick="GetLogCliecked(\'' + ser.name + '\');" class="btn btn-warning">Get Log</button>' + '</span>' +
        '<div class="clearfix"></div></div></div></div>';

        $('#ServicessPanel').append(content);
    });

}


function processUserVersionReport(res) {

    doughnutData = [];

    var content = ""

    res.payload.sort(compareVersionReport);

    var total = 0;
    var count = 0;

    res.payload.forEach(function(pro) {

        color = colorCollection[count].color;
        colorH = colorCollection[count].colorH;
        count += 1;

        var p = {
            value: pro.Summ,
            color: color,
            highlight: colorH,
            label: pro.ClientVersion
        };

        total += pro.Summ;
        doughnutData.push(p);
        content += '<tr><td>' + pro.ClientVersion + '</td><td>' + pro.Summ + '</td></tr>';
    });

    var msg = document.getElementById("total-users");
    if(msg)
        msg.innerHTML = 'Total number: ' + total;
    
    $('#morris-donut-chart').html('');
    $('#morris-donut-chart').append('<canvas id="chart-area" width="500" height="500"></canvas>');

    var ctx = document.getElementById("chart-area").getContext  ("2d");

    if(pie !== null)
        pie.destroy();

    var optionsNoAnimation = {animation : false}
    var myNewChart = new Chart(ctx);
    pie = myNewChart.Doughnut(doughnutData, {responsive : true, animation: false});

    $('#version_table').html('');
    $('#version_table').append(content);

    $('#dataTables-example').DataTable({
            responsive: true
    });
}

function GetRegisteredUsersReport(res) {

    var content = ""

    var total = 0;

    console.log(res);

    res.payload.forEach(function(pro) {
      total += 1;
      content += '<tr><td>' + pro.Email + '</td><td>' + pro.startdate + '</td></tr>';
    });

    var msg = document.getElementById("total-users");
    if(msg)
        msg.innerHTML = 'Total number: ' + total;

    $('#register_table').html('');
    $('#register_table').append(content);

    $('#dataTables-example').DataTable({
            responsive: true
    });
}

function GetPaidUsersReport(res) {

    var content = ""

    var total = 0;

    console.log(res);

    res.payload.forEach(function(pro) {
      total += 1;
      type = "";
      switch (pro.AddOnId) {
        case 1000:
            type = "Zettabox Pro 1 1334A4";
            break;
        case 1001:
            type = "Zettabox Grow 1 user 500 Gb 1 1334A5";
            break;
        case 1002:
            type = "Zettabox Grow 2 user 1 Tb 2 1334A5";
            break;
        case 1003:
            type = "Zettabox Grow 3 user 1.5 Tb 3 1334A5";
            break;
        case 1004:
            type = "Zettabox Grow 4 user 2 Tb 4 1334A5";
            break;
        case 1005:
            type = "Zettabox Grow 5 user 2.5 Tb 5 1334A5";
            break;
        case 1006:
            type = "Zettabox Grow 6 user 3 Tb 6 1334A5";
            break;
        case 1007:
            type = "Zettabox Grow 7 user 3.5 Tb 7 1334A5";
            break;
        case 1008:
            type = "Zettabox Grow 8 user 4 Tb 8 1334A5";
            break;
        case 1009:
            type = "Zettabox Grow 9 user 4.5 Tb 9 1334A5";
            break;
        case 1010:
            type = "Zettabox Grow 10 user 5 Tb 10 1334A5";
            break;

      }
      content += '<tr><td>' + pro.Email + '</td><td>' + pro.Firstname + '</td><td>' + pro.Surname + '</td><td>' + pro.ModifiedOn +  '</td><td>' + pro.AddOnId + '</td><td>' + type +'</td></tr>';
    });

    var msg = document.getElementById("total-users");
    if(msg)
        msg.innerHTML = 'Total number: ' + total;

    $('#register_table').html('');
    $('#register_table').append(content);

    $('#dataTables-example').DataTable({
            responsive: true
    });
}

function processToken(res) {

    if(res.accepted) {

        var url = "/main";
        var form = $('<form style="visibility: hidden" action="' + url + '" method="POST">' +
            '<input name="token" value="' + res.token + '" />' +
            '</form>');
        $('body').append(form);
        form.submit();

    }
}

function logout() {

    document.cookie="_userToken=";
    window.location.replace("/");
}

function processCredential(res) {

    if(res.login) {
        var msg = document.getElementById("message");

        msg.innerHTML = "";
        document.cookie="_userToken=" + res.token;

        var url = "/main";
        var form = $('<form style="visibility: hidden" action="' + url + '" method="POST">' +
          '<input type="text" name="token" value="' + res.token + '" />' +
          '</form>');                $('body').append(form);

        form.submit();
    }
    else {
        msg.innerHTML = res.message;              
    }
}
function processChat(res) {

    try {
        var body = '<div class="header" id="chatitem">' +
            '<strong class="primary-font">' + res.person + '</strong>' +
            '<small class="pull-right text-muted">' +
            '<i class="fa fa-clock-o fa-fw"></i>' + res.createdAt + 
            '</small>' +
            '</div>' +
            '<p>' +
            res.data +
            '</p>';

        $('#Exchange_table').append(body);

        var element = document.getElementById("chatWindow");
        element.scrollTop = element.scrollHeight;
    }
    catch (e) {

        //ignore
    }
}

function topMessages(res) {

    try {
        res.payload = res.payload.reverse();

        res.payload.forEach(function (chatItem) {

            var body = '<div class="header" id="chatitem">' +
                '<strong class="primary-font">' + chatItem.person + '</strong>' +
                '<small class="pull-right text-muted">' +
                '<i class="fa fa-clock-o fa-fw"></i>' + chatItem.createdAt + 
                '</small>' +
                '</div>' +
                '<p>' +
                chatItem.data +
                '</p>';

            $('#chatWindow').append(body);

            var element = document.getElementById("chatWindow");
            element.scrollTop = element.scrollHeight;            
        });
    }
    catch (e) {

        //ignore
    }
}


function messageRecieved(e) {

    try {

        var res = JSON.parse(e.data)

        if(res.type === 'providerStatics') {

            processPeoviderStatics(res);
        }

        if(res.type === 'logger' && res.action === "retrieve") {

            processLogger(res);
        }


        if(res.type === 'DailyReportNotify') {

            processDailyReportNotify(res);
        }

        if(res.type === 'UserVersionReport') {

            processUserVersionReport(res);
        }

        if(res.type === 'HOSProcess') {

            processHOSProcess(res);
        }

        if(res.type === 'GetRegisteredUsersReport') {

            GetRegisteredUsersReport(res);
        }

        if(res.type === 'GetPaidUsersReport') {

            GetPaidUsersReport(res);
        }

        if(res.type === 'chat') {

            topMessages(res);
        }

        if(res.type === 'token') {

            processToken(res);
        }

        if(res.action === 'whoami') {

            processWhoami(res);
        }

        if(res.type === 'credential') {

            processCredential(res)
        }

        else if(res.type === 'token') {

        }
    }
    catch (err) {
      console.log(err);
    }    
}

var colorCollection = [];
for(var i = 0; i < 100; i++){
    var t = getRandomColor();

    var tt = {
        color: t.color, 
        colorH: t.colorH
    };
    colorCollection.push(tt);
}

function init() {

    cookies.forEach(function (coo){

        coo = coo.trim(" ");

        if(coo.substring(0, 11) === '_userToken=') {

            var tokenn = coo.substring(11, coo.length);
            token = tokenn;
            console.log(token)
        }
    });


    ws = new WebSocket("ws://"+baseUrl+":8001/");

    ws.onopen = function() {        
        output("onOpen");
        sendRequest()

        if(type === "TaskManager")
            setInterval(function() {sendRequest();}, 2000);

        ws.send(JSON.stringify(
            {
                to: datamanager,
                type: "chat",
                action: "retrieve",
                payload:
                {
                    type: "top",
                    no: 20
                }
            }
        ));

        if(type != "UserVersionReport" && type != "GetRegisteredUsersReport" && type != "TaskManager")
            ws.send(JSON.stringify({
                to: "ZettaboxDataAnalyze",
                type: "providerStatics",
                action: "retrieve",
            }));
    };  

    ws.onmessage = messageRecieved;

    ws.onclose = function() {
        output("onClose");
    };
    ws.onerror = function() {
        output("onError");
    };


    $('#btn-chat').click(function(e){ 
        e.preventDefault();
    });
}

function getval() {

    sel = document.getElementById("providerSelect");

    var total = 0;
    var count = 0;

    lineChartData.datasets[1].data = [];

    recentData.data.forEach(function(pro) {
    if(pro){
        var a = pro.createdAt.substring(11, 16) + "GMT";

        pro.providers.forEach(function (p) {
            if(p.name === sel.value)
                lineChartData.datasets[1].data.push(p.num);  
        });
    }
    else
        lineChartData.datasets[1].data.push(0);
    });

    var ctx = document.getElementById("canvas").getContext("2d");

    if(lineChart !== null)
        lineChart.destroy();

    var optionsNoAnimation = {animation : false}
    var myNewChart = new Chart(ctx);
    lineChart = myNewChart.Line(lineChartData, {responsive : true, animation: false});
}
