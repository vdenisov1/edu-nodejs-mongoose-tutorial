const http = require('http');
const mongoose = require('mongoose');
const uriString = process.env.MONGOLAB_URI || 
			 	  process.env.MONGOHQ_URL || 
			 	  'mongodb://localhost/HelloMongoose';
const options = {
	user: process.env.MONGODB_USER || '',
	pass: process.env.MONGODB_AUTH || ''
};

const port = process.env.PORT || 5000;

mongoose.connect(uriString, options, function(err, res){
	if(err){
		console.log('Error connecting to: ' + uriString + '. ' + err);
	}else{
		console.log('Succeeded connected to: ' + uriString);
	}
});

let userSchema = new mongoose.Schema({
	name: {
		first: String,
		last: { type: String, trim: true }
	},
	age: { type: Number, min: 0 }
});

let PUser = mongoose.model('PowerUsers', userSchema);

PUser.remove({}, function(err){
	if(err){
		console.log('error deleting old data.');
	}
});

/** Create User **/

let users = [
		{
			name: { first: 'John', last: '    Doe ' },
			age: 25
		},
		{
			name: { first: 'Jane', last: 'Doe' },
			age: 65
		},
		{
			name: { first: 'Alice', last: 'Smith ' },
			age: 45
		}
	];

for(let i = 0; i < users.length; i++){
	let user = users[i];
	let pUser = new PUser(user);
	pUser.save(function(err){
		if(! err){
			console.log('Created User ' + user.name.first + ' ' + user.name.last + '.');
		}else{
			console.log('Error creating user ' + user.name.first + ' ' + user.name.last + ': ' + err);
		}
	});
}

let found = ['DB Connection not yet established. Try again later. Check the console output for error messages if this persists.'];

http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	createWebPage(req, res);
}).listen(port);

function createWebPage(req, res){
	PUser.find({}).exec(function(err, result){
		if(!err){
			res.write(html1 + JSON.stringify(result, undefined, 2) + html2 + result.length + html3);
			let query = PUser.find({'name.last': 'Doe'});
			query.where('age').gt(64);

			query.exec(function(err, result){
				if(!err){
					res.end(html4 + JSON.stringify(result, undefined, 2) + html5 + result.length + html6);
				}else{
					res.end('Error in second query. ' + err);
				}
			});
		}else{
			res.end('Error in first query.' + err);
		}
	});
}

console.log('http server will be listening on port %d', port);
console.log('CTRL+C to exit');

let html1 = '<title> hello-mongoose: MongoLab MongoDB Mongoose Node.js Demo on Heroku </title> \
<head> \
<style> body {color: #394a5f; font-family: sans-serif} </style> \
</head> \
<body> \
<h1> hello-mongoose: MongoLab MongoDB Mongoose Node.js Demo on Heroku </h1> \
See the <a href="https://devcenter.heroku.com/articles/nodejs-mongoose">supporting article on the Dev Center</a> to learn more about data modeling with Mongoose. \
<br\> \
<br\> \
<br\> <h2> All Documents in MonogoDB database </h2> <pre><code> ';
let html2 = '</code></pre> <br\> <i>';
let html3 = ' documents. </i> <br\> <br\>';
let html4 = '<h2> Queried (name.last = "Doe", age >64) Documents in MonogoDB database </h2> <pre><code> ';
let html5 = '</code></pre> <br\> <i>';
let html6 = ' documents. </i> <br\> <br\> \
<br\> <br\> <center><i> Demo code available at <a href="http://github.com/mongolab/hello-mongoose">github.com</a> </i></center>';
