var express = require('express')
var mysql = require('mysql');

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

app.post('/join', function(req, res){

    console.log(req.body);

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