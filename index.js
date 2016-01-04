var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var bodyParser = require('body-parser')

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/note';
var ObjectId = require('mongodb').ObjectId;

var dbMethods = {};

MongoClient.connect(url, function(err, db){
	var col = db.collection('notes');
	dbMethods.newNote = function(data, callback){
		col.insertOne(data)
			.then(function(result){
				callback(result);
		})	
	}
	dbMethods.updateNote = function(id, data, callback){
		col.updateOne({_id: new ObjectId(id)}, {$set: data}).then(function(result){
			callback(result);
		})
	}
	dbMethods.deleteNote = function(id, callback){
		col.deleteOne({_id: new ObjectId(id)}).then(function(result){
			callback(result);
		})
	}
	dbMethods.queryAll = function(callback){
		col.find({}).toArray(function(err, docs){
			callback(docs);
		})
	}
})

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/new', function(req, res){
	dbMethods.newNote(req.body, function(result){
		res.send(result);
	})
})

app.post('/delete', function(req, res){
	dbMethods.deleteNote(req.body._id, function(result){
		res.send(result);
	})
})

app.post('/update', function(req, res){
	dbMethods.updateNote(req.body._id, {title: req.body.title, content: req.body.content}, function(result){
		res.send(result);
	})
})


app.get('/list', function(req, res){
	dbMethods.queryAll(function(data){
		res.send(data);
	})
})


http.listen(10000, function(){
  console.log('listening on *:10000');
});