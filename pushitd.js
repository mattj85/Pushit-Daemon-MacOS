#!/usr/bin/env node
var _AUTHTOKEN = '' ;
var _WSENDPOINT = 'wss://stream.pushbullet.com/websocket' ;
var _PUSHENDPOINT = 'https://api.pushbullet.com/v2/pushes' ;

const WebSocket = require('ws') ;
const NotificationCenter = require('node-notifier').NotificationCenter;
const Request = require('request') ;

const ws = new WebSocket(_WSENDPOINT + '/' + _AUTHTOKEN) ;
ws.on('open', function open(){
	console.log('[+] Connected to PushBullet Stream') ;
}) ;

var Notifier = new NotificationCenter();
ws.on('message', function incoming(data){
	var nowMs = (new Date).getTime()/1000 ;
	var jsonObj = JSON.parse(data) ;
	if ( jsonObj.type != 'nop' ){
		if ( jsonObj.subtype == 'push' ) {
			setTimeout(function(){
				options = {
					url: _PUSHENDPOINT + '?limit=1',
					headers: {
						'Access-Token':_AUTHTOKEN
					}
				}
				Request.get(options, function(error, response){
					var responseObj = JSON.parse(response.body) ;
					var pushBody = responseObj.pushes[0].body ;
					var senderName = responseObj.pushes[0].sender_name ;
					var senderEmail = responseObj.pushes[0].sender_email ;
					
					if ( responseObj.pushes[0].type == 'note' ){
						Notifier.notify({
							title: 'PushIt! ' + senderName,
							message: pushBody,
							sound: 'Frog',
							timeout: 300,
							reply: true
						}, function(error, response, meta){
							var replyStr = meta.activationValue ;
							noteReply(senderEmail, replyStr) ;
						})
					}
				}) ;
			}, 1000 ) ;
		}
	}
}) ;

function noteReply(user, body) {
	replyOptions = {
		url: _PUSHENDPOINT,
		headers: {
			'Access-Token': _AUTHTOKEN,
			'Content-Type' : 'application/x-www-form-urlencoded',
		},
		body: 'type=note&email='+user+'&body='+body,
	}
	Request.post(replyOptions,function(error, response){}) ;

}