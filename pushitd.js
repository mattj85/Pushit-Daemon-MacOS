#!/usr/bin/env node
var _MYIDEN = '' ;
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
	var jsonObj = JSON.parse(data) ;
	console.log(data) ;
	if ( jsonObj.type == 'tickle' && jsonObj.subtype == 'push' ){
		getData() ;
	}
}) ;

function getData(){
	options = {
		url: _PUSHENDPOINT + '?limit=1' ,
		headers: {
			'Access-Token': _AUTHTOKEN,
		},
	}
	Request.get(options, function(error, response){
		var responseObj = JSON.parse(response.body) ;
		var pushBody = responseObj.pushes[0].body ;
		var senderIden = responseObj.pushes[0].sender_iden ;
		if ( pushBody != 'undefined' && senderIden != _MYIDEN ) {
			var senderName = responseObj.pushes[0].sender_name ;
			var senderEmail = responseObj.pushes[0].sender_email ;
			Notifier.notify({
				title: 'PushIt!',
				message: pushBody,
				sound: 'Frog',
				wait: 300,
				reply: true
			}, function(err, resp, meta){
				var replyBody = meta.activationValue ;
				if ( replyBody != '' ) {
					noteReply(senderEmail, replyBody) ;
				}
			}) ;
		}
	}) ;
}

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