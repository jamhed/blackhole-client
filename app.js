var Config = require('./config');
var Crypto = require('crypto');
var Crossbar = require('crossbar');
var WebSocket = require('ws');
var Influx = require('influx');

var cb_client = new Crossbar({
    'url': Config.crossbar.host,
    'port': Config.crossbar.port,
    'validate': true
});

var clear_creds = Config.crossbar.username + ":" + Config.crossbar.password;
var hash_creds = Crypto.createHash('md5').update(clear_creds).digest("hex");

const db = new Influx.InfluxDB(Config.influxdb);

function writeCall(call) {
	console.log([call.callee_id_number, call.caller_id_number, call.hangup_cause, call.duration_seconds, call.ringing_seconds]);
	db.writePoints(
		[
			{
				measurement: 'call',
				tags: {
					direction: call.call_direction,
					callee_name: call.callee_id_name,
					callee_number: call.callee_id_number,
					caller_name: call.caller_id_name,
					caller_number: call.caller_id_number,
					channel_state: call.channel_call_state,
					hangup_cause: call.hangup_cause
				},
				fields: {
					billing: call.billing_seconds,
					duration: call.duration_seconds,
					ringing: call.ringing_seconds
				},
				timestamp: parseInt(call.timestamp) - 62167219200
			}
		],
		{
			database: 'cdr',
			precision: 's'
		}
	);
}

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
    var ws = new WebSocket(Config.blackhole.uri);
    ws.on('open', function open() {
        console.log({"login account": account_id});
        add_listeners(ws, account_id, auth_token);
    });
    ws.on('message', function(data, flags) {
        handle_data(data);
    });
}

function make_packet(account_id, auth_token, binding) {
    var Packet = {
        action: "subscribe",
        auth_token: auth_token,
        data: {
            account_id: account_id,
            binding: binding
        }
    };
    return JSON.stringify(Packet);
}

function add_listeners(ws, acc, token) {
	 ws.send(make_packet(acc, token, "call.CHANNEL_DESTROY.*"));
}

function handle_data(Packet) {
	ev = JSON.parse(Packet);
	if (ev.data && ev.name == "CHANNEL_DESTROY") {
		writeCall(ev.data);
	} else {
		console.log(ev);
	}
}
