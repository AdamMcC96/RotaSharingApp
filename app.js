var http = require('http');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const session = require('express-session'); // session 
var bodyParser = require('body-parser'); //bodyParser
var expressValidator = require('express-validator'); // validator
var formidable = require('formidable'); // formidable

var exhbs = require('express-handlebars');
var passport = require('passport');
var bcrypt = require('bcryptjs');
var logger = require('morgan');
var fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
// Use the session middleware

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'keyboard cat', saveUninitialized: false, resave:false}));


// start of /login
app.post('/login',function(req,res){
    console.log('/login');
    
    // get the username from the request.
    var username = req.body.username;
    var pass = req.body.password;
    console.log("User name = "+username);
  
          var mysql = require('mysql')
          var connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'root',
            database : 'rota'
          });
  
          connection.connect();
      
      var sql = "select * from rota.users where username = '"+username+"'";
      console.log(sql);
      
      connection.query(sql, function (err, rows, fields) {
          console.log(rows);
          console.log("INSIDE");
          console.log(rows[0].username);
          
          var passHash = rows[0].password; // set passHash = hashed pass from db
          console.log(passHash);
          console.log(pass);
          console.log(rows.length);
          if (err) throw err;
          if (rows.length == 1){
  
              bcrypt.compare(pass, passHash, function(err, res) {
                  if (err){
                      //handle error
                      console.log("Err" + res);
                      //connection.end();
                      throw err;
                  
                  }
                  if (res){ // if the hash of pass = passHash is true
                      console.log("Pass equal" + res);
  
                  //put into the session
                      //sess.username = rows[0].username;
                      req.session.username = rows[0].username;
                      req.session.password = rows[0].password;
                      req.session.fname = rows[0].fname;
                      req.session.email = rows[0].email;
                      req.session.lname = rows[0].lname;
                      username = req.session.username;
                      //app.set('username', username);
                     console.log("Pass equal" +" "+username+" "+ req.session.username +" "+ rows[0].username);
                      
  
                  } // end if (res)
                  else{
                      console.log("Error hashes don't match"  + res);
                      //connection.end();
                  } // end of else
          }); // end of bcrypt
      } // end of rows.length
      else{
          console.log("err else");
          connection.end();
      }
                
      }); // end of query
      res.send(username);
      connection.end();
  }); // end of /login
  app.get('/login', function (req, res) {
      
      console.log("Fname: " + req.session.fname);
      console.log('/login');
      var data = req.session.username;
      console.log("app.get " + data);
      res.send('The value is ' + data);
  }); // end of get /login
app.post('/signup',function(req,res){
    console.log('/signup');
    // requesting the details from the signup form
    var user = req.body.username;
    var pass = req.body.password;
    var email = req.body.email;
    var fname = req.body.fname;
    var lname = req.body.lname;
    console.log("Og Pass: " +pass);
    bcrypt.hash(pass, 8, function(err, hash) {
    pass = hash;
    // end of request
    
    var data = "";
    // testing the details
    console.log("User name = "+user);
    console.log("First name = "+fname);
    console.log("E-Mail = "+email);
    console.log("Password = "+pass);
    console.log("Last name = "+lname);
    // end of test
    var mysql = require('mysql')
    var connection = mysql.createConnection({
          host     : 'localhost',
          user     : 'root',
          password : 'root',
          database : 'rota'
    });
    connection.connect();
    console.log("Connect to database");
    var sql = "select * from rota.users where username = '"+user+"' OR email = '"+email+"' ;";
    connection.query(sql, function (err, rows, fields) {
        console.log(rows);
        if (rows.length != 0){
            
            console.log("Error! Duplicate E-Mail or Username");
            data = "fail";
            connection.end();
            
        }
        else if(rows.length == 0){
            console.log("Username & Email are unique");
            connection.query("INSERT INTO rota.users (username, password, fname, lname, email) values ('"+user+"', '"+pass+"', '"+fname+"', '"+lname+"', '"+email+"')");
            if (err) throw err;
            data = "pass";
            connection.end();
        }
        console.log(data);
        res.send(data);
        }); // salt
    });
});
// end of /signup


// start of /addEvent
app.post('/addEvent',function(req, res){
    
    var username = req.session.username; // gets the user's username from the session
    console.log('/addEvent' + " " + username);
    // requesting the details from the addEvent form
    var eventTitle = req.body.eventTitle;
    var eventDay = req.body.eventDay;
    var eventYear = req.body.eventYear;
    var eventMonth = req.body.eventMonth;
    var eventLocation = req.body.eventLocation;
    var eventCity = req.body.eventCity;
    var eventCountry = req.body.eventCountry;
    var eventTime = req.body.eventTime;
    var eventType = req.body.eventType;
    
    var data;

    // end of request
    var data = "";
    // testing the details
    console.log("User name = "+username);
    console.log("Event  Title = "+ eventTitle);
    console.log("Event  City= "+ eventCity);
    console.log("Event  Time= "+ eventTime);
    console.log("Event  Type= "+ eventType);
    console.log("Event  Country= "+ eventCountry);
    console.log("Event  Location= "+ eventLocation);
    console.log("Event  Date= "+ eventYear + "/" + eventDay + "/" + eventMonth);
    // end of test
    var mysql = require('mysql')
    var connection = mysql.createConnection({
          host     : 'localhost',
          user     : 'root',
          password : 'root',
          database : 'rota'
    });
    eventTime = eventTime + ":00";
    console.log(eventTime);
    connection.connect();
    console.log("Connect to database");
    var sqlQuery = 'INSERT INTO rota.events (username, eventTitle, eventMonth, eventYear, eventDay, eventTime, eventLocation, eventCity, eventCountry, eventType) values ("'+username+'", "'+eventTitle+'", "'+eventMonth+'", "'+eventYear+'", "'+eventDay+'", "'+eventTime+'", "'+eventLocation+'", "'+eventCity+'","'+eventCountry+'", "'+eventType+'");';
    console.log(sqlQuery);
    connection.query(sqlQuery, function (err, rows, fields) {
        if (err){
            throw err;
        }else{
            console.log("SQL Success");
            connection.end();
            data="pass";
            res.send(data);
        }
    });
});
// end of /addEvent

/*
// start of /getDateData
app.post('/getDateData',function(req,res){
    var username = req.session.username; // gets the user's username from the session
    var eventMonth = req.body.eventMonth;
    var eventYear = req.body.eventYear;
    var eventDay = req.body.eventDay;
    
    var mysql = require('mysql')
        var connection = mysql.createConnection({
          host     : 'localhost',
          user     : 'root',
          password : 'root',
          database : 'rota'
        });

        connection.connect();
    
    var sql = "select * from rota.events where username = '"+username+"' and eventMonth = '"+eventMonth+"' and eventYear = '"+eventYear"' and eventDay = '"+eventDay+"'";
    console.log(sql);
    
    var eventName = "";
    var id ="";
    connection.query(sql, function (err, rows, fields) {
        for(var j=0; j< rows.length; j++){
            id = rows[j].id;
            eventName = eventName + '<a data-ajax="false" href="/event?id=' + id + '">' + rows[j].eventName + "</a><br>";
            
        }
        res.send(eventName);
    });
    
    
    
}); // end of /getDateData

app.get('/', function(req, res, next) {
    //var username = sess.username;
    var fname = sess.fname;
    var lname = sess.lname;
    var email = sess.email;
    var password = sess.password;
    
    //app.set('username', username);
    app.set('fname', fname);
    app.set('lame', lname);
    app.set('email', email);
    app.set('password', password);
    res.render('index', { title: 'Rota App', firstname: req.params.fname});
    //req.session.errors = null;
    //req.session.success = null;
});*/

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
