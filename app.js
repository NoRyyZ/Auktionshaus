const express = require('express')
var bodyParser = require("body-parser")
var dot = require("dot").process({path: "./templates"});
const app = express()
var my_ip = '0.0.0.0'


const pgp = require('pg-promise')(/* initialization options */);

let set_arg = function(name, default_val) {
    if (!(typeof(argv[name]) == 'undefined')) {return argv[name];}
    else {return default_val;}
};

var argv = require('minimist')(process.argv.slice(2));
var port = set_arg('port', 3000)
var db_host = set_arg('db', 'localhost')
var db_port = set_arg('db_port', 5432)


//Connecting to DB
const cn = {
    host: db_host, // server name or IP address;
    port: db_port,
    database: 'auktionshaus',
    user: 'postgres',
    password: '12345'
};
const db = pgp(cn);



app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function(req, res) {
    db.many("SELECT username FROM users ORDER BY cdate DESC LIMIT 3", [])
    .then(response => {
        var page = dot.index({uname1:response[0].username,uname2:response[1].username,uname3:response[2].username});
        res.end(page);
    })
    .catch(error => {
        console.log(error);
    });
});

app.get('/register', function(req, res) {
    res.sendFile('./register.html', { root: __dirname });
});

app.get('/style.css', function(req, res) {
    res.sendFile('./static/style.css', { root: __dirname });
});

app.post('/register',function(req,res){
    var data=req.body;
    //CHeck values, MAKE BETTER RETARD!
    db.none('INSERT INTO Users(PwHash, Email, Username) values($1, $2, $3)',[data.pwd, data.mail, data.uname])
    .then(output => {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end("Registration successfull!");
    })
    .catch(error => {
        res.writeHead(409, {'Content-Type': 'text/plain'});
        res.end(error.constraint);
    });
});

app.get('/register.js', function(req, res) {
    res.setHeader("Content-Type", "text/javascript");
    res.sendFile('./static/register.js', { root: __dirname });
});




app.listen(port,my_ip,() => console.log(`Example app listening on port ${my_ip}:${port}! DB on: ${db_host}`))