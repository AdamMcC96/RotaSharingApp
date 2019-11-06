var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/signup',function(req,res){
    console.log('/signup');
    // requesting the details from the signup form
    var user = req.body.username;
    var pass = req.body.password;
    var email = req.body.email;
    var fname = req.body.fname;
    var lname = req.body.lname;
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
    var sql = "select * from rota.users where username = '"+user+"' OR email = '"+email+"' ";
    connection.query(sql, function (err, rows, fields) {
        console.log(rows.length);
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
    });
});
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
