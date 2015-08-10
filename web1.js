var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var http = require('http');
var url = require('url');
var bodyParser = require('body-parser');
var app = express();
var mysql = require('mysql');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, Content-Type');
  next();
});

app.listen(4001);
console.log('Listening at 4001');

DATABASE_HOST = 'localhost';
DATABASE_NAME = 'web';
DATABASE_USERNAME = 'root';
// DATABASE_PASSWORD = '12345';
DATABASE_PASSWORD = 'Hello123';

var connectionNode = mysql.createConnection({
    host: DATABASE_HOST,
    user: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME
});


var searchTerm = 'screen+scraping';
var url = 'http://www.bing.com/search?q=' + searchTerm;

var myRegExp =/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
var regexEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

function extractURLsFromURL(url, startID){
	console.log(startID)
	request(url, function(err, resp, body){
		if (!err && resp.statusCode == 200) {
		  	$ = cheerio.load(body);
		  	links = $('a'); //jquery get all hyperlinks
		  	$(links).each(function(i, link){
			    // console.log($(link).text() + ':\n  ' + $(link).attr('href'));
			    if (myRegExp.test($(link).attr('href'))){
			    	if($(link).attr('href').length < 200){
						saveURL(url, $(link).attr('href'));
					}
			    	// console.log($(link).attr('href') + " : a valid URL.");
				}
		  	});


		  	function extractEmails ( text ){
				return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
			}
			 
			// EXAMPLE #1
			var emails = extractEmails (body);
			var j = 0;
			if(emails != null){
				while(emails[j] != undefined){
					console.log(emails[j]);
					saveEmail(emails[j]);
					j++;
				}
			}

		}
		getInitialURL(++startID);

	});
}

var startID = 5243796;
function getInitialURL(startID){
	var strQuery = "select toURL from url_link where id = " + startID;
	connectionNode.query( strQuery, function(err, rows){
        if(err) {
            console.log("Error in getInitialURL: " + startID);
	  		getInitialURL(++startID);
        }else{
        	if(rows.length > 0){
	    	   	extractURLsFromURL(rows[0].toURL, startID)
	        }else{
				getInitialURL(++startID);	        	
	        }
        }
    });
}

function saveURL(fromURL, toURL){
	if(fromURL == toURL){
		return 1;
	}
	var strQuery = "REPLACE INTO url_link values (\"" + fromURL + "\",\"" + toURL + "\", now(), null)"; 
    // console.log(strQuery);
    connectionNode.query( strQuery, function(err, rows){
        if(err) {
            console.log("Error in saveURL" , err);
        }else{
            // console.log('Added @ ' + new Date())
        }
    });
}

function saveEmail(email){
	var strQuery = "REPLACE INTO email values (\"" + email + "\", now(), null)"; 
    // console.log(strQuery);
    connectionNode.query( strQuery, function(err, rows){
        if(err) {
            console.log("Error in saveEmail" , err);
        }else{
            // console.log('Added @ ' + new Date())
        }
    });
}

// extractURLsFromURL(url);
getInitialURL(startID);

