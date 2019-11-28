var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session'); // session 
var bcrypt = require('bcryptjs');
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
// Use the session middleware
app.use(expressSession({ secret: 'max', saveUninitialized: false, resave:false}));
app.use(express.static(path.join(__dirname, 'public')));

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
        
        bcrypt.compare(pass, passHash, function(err, res) {
    
            if (res){ // if the hash of pass = passHash is true
                console.log("Pass equal");

            //put into the session
                req.session.username = rows[0].username;
                req.session.password = rows[0].password;
                req.session.fname = rows[0].fname;
                req.session.email = rows[0].email;
                req.session.lname = rows[0].lname;
        
                if (err) throw err;
                if (rows.length != 1){
                    console.log("Error; Username & Password did not match");
                    connection.end();
                }else{ // end of rows.length
                    connection.end();
                } // end of else
            } // end if (res)
            else{
                console.log("Error hashes don't match");
                connection.end();
            } // end of else
        }); // end of bcrypt
        //res.render({firstname: req.params.fname});
        
              
    }); // end of query
    res.send(username);

}); // end of /login

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
