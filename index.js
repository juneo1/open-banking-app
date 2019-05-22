var express = require('express')
var mysql = require('mysql');
var request = require('request');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'djwns331!',
  database : 'fintech'
});
connection.connect();

app = express()
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/', function (req, res) {
  res.render('index')
})

app.get('/join', function (req, res) {
    res.render('join')
  })

app.get('/authResult', function (req, res) {
    var auth_code = req.query.code;
    var getTokenUrl = "https://testapi.open-platform.or.kr/oauth/2.0/token";
    var option = {
        method : "POST",
        url :getTokenUrl,
        headers : {
        },
        form : {
            code : auth_code,
            client_id : "l7xxcf48e8994cac43e1b329def19c111b6a",
            client_secret : "42ad05c7506b46a29e93c3b37cfdcba4",
            redirect_uri : "http://localhost:3000/authResult",
            grant_type : "authorization_code"
        }
    };

    request(option, function (err, response, body){
        if(err) throw err;
        else {
            console.log(body);
            var accessRequestResult = JSON.parse(body);
            console.log(accessRequestResult);
            res.render("resultChild", {data : accessRequestResult})
        }
    })
})

app.post('/join', function(req, res){
    console.log(req);
    var name = req.body.name;
    var birthday = new Date();
    var email = req.body.email;
    var password = req.body.password;
    var phone = "01012345678";

    console.log(name, email, password);
    var sql = 'INSERT INTO `fintech`.`user` (`name`, `birthday`, `user_id`, `user_password`, `phone`) VALUES (?,?,?,?,?);'
    connection.query(sql, [name, birthday, email, password, phone], function (error, results) {
      if (error) throw error;
      else {
          console.log(this.sql);
          res.json(1);
      }
    });
})

app.get('/ajaxTest', function(req, res){
    console.log("ajax call");
    var result = "hello";
    res.json(result);
})



app.listen(3000)