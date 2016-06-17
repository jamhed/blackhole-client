var Config = require('./config');
var Crypto = require('crypto');
var Crossbar = require('crossbar');
var WebSocket = require('ws');

console.log('blackhole ws client');

var cb_client = new Crossbar({
    'url': Config.crossbar.host,
    'port': Config.crossbar.port,
    'validate': true
});

var clear_creds = Config.crossbar.username + ":" + Config.crossbar.password;
var hash_creds = Crypto.createHash('md5').update(clear_creds).digest("hex");

cb_client.api.user_auth.create_user_auth({
    'data': {
        'credentials': hash_creds,
        'account_name': Config.crossbar.account_name
    }
}, function(err, data) {
    if (data == null) {
        console.log(err);
        process.exit(1);
    }
    ws_connect( data.data.account_id, data.auth_token );
});

function ws_connect(account_id, auth_token) {
    console.log("authorized with acc_id:", account_id, "token:", auth_token);
    var ws = new WebSocket(Config.blackhole.uri);
    ws.on('open', function open() {
        add_listeners(ws, account_id, auth_token);
    });
    ws.on('message', function(data, flags) {
        handle_data(data);
    });
}

function make_packet(account_id, auth_token, binding) {
    var Packet = {
        action: "subscribe",
        account_id: account_id,
        auth_token: auth_token,
        binding: binding
    };
    return JSON.stringify(Packet);
}

function add_listeners(ws, acc, token) {
    ws.send(make_packet(acc, token, "conference.event.*.*"));
}

function handle_data(Packet) {
    data = JSON.parse(Packet);
    console.log(data["Node"], data["App-Name"], data["Event-Name"], data["Event"]);
    console.log(data);
}
