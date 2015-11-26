/*
=========================================================================================
File: SessionTestModule.js
Developer: Fredrik Lautrup
Created Date: 2014

Description:
Prof of concept implementation of the Session Module API that implements
persistant storage of sessions using files

WARNING!:
This code is intended for testing and demonstration purposes only.  It is not meant for
production environments.  In addition, the code is not supported by Qlik.

Change Log
Developer                       Change Description                      Modify Date
-----------------------------------------------------------------------------------------
Fredrik Lautrup                 Initial Release                         October 7, 2014


-----------------------------------------------------------------------------------------


=========================================================================================
*/

var https = require('https');
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

var app = express();

var defpath = "C:\\ChangeTo\\SessionTestModule\\Sessions\\";


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/session', function(req, res) {
  // Create a user with a session
  console.log("Created user session");
  console.log("Request " + JSON.stringify(req.body));
  var sessionobj = createSessionStorage(req);
  res.send(JSON.stringify(sessionobj));
  console.log("Response " + JSON.stringify(sessionobj));
});

app.get('/session/:sid', function(req, res) {
  // Return session object for :id
  console.log("Read session");
  console.log("Request SID " + req.params.sid);
  var sessions = getSessionFromSid(req.params.sid);
  if (sessions === "") {
		// The correct behaviour should be to return 404 but currently a bugg
    //res.statusCode = 404;
    res.send(sessions);
  } else {
    res.send(sessions);
  }
});

app.delete('/session/:sid', function(req, res) {
  // Delete session object for :sid
  console.log("Delete session");
  console.log("Request " + req.params.sid);
  var sessid = req.params.sid;
  var session = deleteSessionFromSid(sessid);
  res.send(session);
});

app.get('/user/:ud/:uid', function(req, res) {
  // Return all sessions for :id
  console.log("Read users sessions");
  console.log("Request " + req.params.ud + " " + req.params.uid);
  var userdirectory = req.params.ud;
  var userid = req.params.uid;
  var session = getSessionFromUid(userid, userdirectory);
  res.send(session);
});

app.delete('/user/:ud/:uid', function(req, res) {
  // Delete all sessions for :id
  console.log("Delete users sessions");
  console.log("Request " + req.params.ud + " " + req.params.uid);
  var userdirectory = req.params.ud;
  var userid = req.params.uid;
  var session = deleteSessionFromUid(userid, userdirectory);
  res.send(session);
});

app.post('config', function(req, res) {
  //Set config
  console.log("Set configuration");
});

//Server options to run an HTTPS server
var httpsoptions = {
  pfx: fs.readFileSync('Server.pfx'),
  passphrase: 'test'
};

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
};

function createSessionStorage(req) {
  //Create session json files
  var sessionobj = req.body;

  if (sessionobj.SessionId === undefined || sessionobj.SessionId === null) {
    sessionobj.SessionId = generateUUID();
  }

	//Test  if it is the first session
  newuser = firstSession(sessionobj.UserDirectory, sessionobj.UserId);

	//Write session object to file
  fs.writeFileSync(defpath + sessionobj.UserDirectory + "-" + sessionobj.UserId + "-" + sessionobj.SessionId + ".json", JSON.stringify(sessionobj));

	//Add to session object the property NewUser
	sessionobj.NewUser = newuser;

  return sessionobj;
}

function firstSession(ud, uid) {
  //Return true if first session else false
  var newfile = true;
  var filenamestr = ud + "\-" + uid;
  var filenamepatt = new RegExp(filenamestr, "i");
  var sessionFiles = fs.readdirSync(defpath);

  for (var count = 0; count < sessionFiles.length; count++) {
    if (filenamepatt.test(sessionFiles[count]) == true) {
      newfile = false;
    }
  }
  return newfile;
}

function getSessionFromSid(sid) {
  //Get all sessions from sid
  var sessions = "";
  var sessionFiles = fs.readdirSync(defpath);
  for (var count = 0; count < sessionFiles.length; count++) {
    if (sessionFiles[count].indexOf(sid + ".json") > -1) {
      sessions = sessions + fs.readFileSync(defpath + sessionFiles[count]);
    }
  }
  return sessions;
}

function deleteSessionFromSid(sid) {
  //Delete all sessions from sid
  var sessions = "";
  var sessionFiles = fs.readdirSync(defpath);
  for (var count = 0; count < sessionFiles.length; count++) {
    if (sessionFiles[count].indexOf(sid + ".json") > -1) {
      sessions = sessions + fs.readFileSync(defpath + sessionFiles[count]);
      fs.unlink(defpath + sessionFiles[count]);

    }
  }
  return sessions;
}

function deleteSessionFromUid(uid, ud) {
  //Get all sessions from sid
	var morethanone=false;
  var filenamestr = ud + "\-" + uid;
  var filenamepatt = new RegExp(filenamestr, "i");
  var sessions = "[";
  var sessionFiles = fs.readdirSync(defpath);
  for (var count = 0; count < sessionFiles.length; count++) {
    if (filenamepatt.test(sessionFiles[count]) == true) {
      if (morethanone) {
        sessions = sessions + ",";
      }
      sessions = sessions + fs.readFileSync(defpath + sessionFiles[count]);
      fs.unlink(defpath + sessionFiles[count]);
			morethanone=true;
    }
  }
  sessions = sessions + "]"
  return sessions;
}

function getSessionFromUid(uid, ud) {
  //Get all sessions from uid
	var morethanone=false;
  var filenamestr = ud + "\-" + uid;
  var filenamepatt = new RegExp(filenamestr, "i");
  var sessions = "[";
  var sessionFiles = fs.readdirSync(defpath);
  for (var count = 0; count < sessionFiles.length; count++) {
    if (filenamepatt.test(sessionFiles[count]) == true) {
      if (morethanone) {
        sessions = sessions + ",";
      }
      sessions = sessions + fs.readFileSync(defpath + sessionFiles[count]);
			morethanone=true;
    }
  }
  sessions = sessions + "]";
  return sessions;
}


//Start listener
https.createServer(httpsoptions, app).listen(8188);
