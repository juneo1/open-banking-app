var express = require('express')
const app = express()
var mysql = require('mysql');
var request = require('request');
var jwt = require('jsonwebtoken');
var tokenKey = 'wn)dlfosemtltmxpawm'
var auth = require('./lib/auth');
var cors = require('cors');


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'djwns331!',
  database : 'fintech'
});
connection.connect();

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(cors());
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
    console.log("authResult");
    var auth_code = req.query.code;
    var getTokenUrl = "https://testapi.open-platform.or.kr/oauth/2.0/token";
    var option = {
        method : "POST",
        url :getTokenUrl,
        headers : {
            "Content-Type" : "application/x-www-form-urlencoded; charset=UTF-8"
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
    console.log('가입 시작')
    console.log(req);
    var name = req.body.name;
    var birthday = new Date();
    var email = req.body.email;
    var password = req.body.password;
    var phone = "01012345678";
    var accessToken = req.body.accessToken;
    var refreshToken = req.body.refreshToken;
    var useNum = req.body.useseqnum;

    console.log(name, email, password);
    var sql = 'INSERT INTO `fintech`.`user` (`name`, `birthday`, `user_id`, `user_password`, `phone`, accessToken, refreshToken, userseqnum) VALUES (?,?,?,?,?,?,?,?);'
    connection.query(sql, [name, birthday, email, password, phone, accessToken, refreshToken, useNum], function (error, results) {
      if (error) throw error;
      else {
          console.log(this.sql);
          res.json(1);
      }
    });
})

app.get('/login', function (req, res) {
    res.render('login')
     })

app.get('/qr', function(req, res){
    res.render('qr')
})

app.get('/withdraw', function(req, res){
    res.render('withdraw')
})

app.post('/login', function(req, res) {
    console.log(req);
    var userEmail = req.body.email;
    var userPassword = req.body.password;
    console.log("/login");
    console.log(userEmail, userPassword);

    var sql = "SELECT * FROM user WHERE user_id = ?";
    connection.query(sql, [userEmail], function(error, results) {
        if(error) throw error;
        else {
            //console.log(results[0]);
            //console.log(userPassword, results[0].user_password);
            if(userPassword == results[0].user_password){
                jwt.sign(
                    {
                        userName : results[0].name,
                        userId : results[0].user_id
                    },
                    tokenKey,
                    {
                        expiresIn : '1d',
                        issuer : 'fintech.admin',
                        subject : 'user.login.info'
                    },
                    function(err, token){
                        console.log('로그인 성공', token)
                        res.json(token)
                    }
                )
            }
            else {
                res.json('등록정보가 없습니다');
            }
        }
    });
})


app.post('/getUser', auth, function(req, res) {
    var userId = req.decoded.userId;
    var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
    connection.query(sql, [userId], function (err, results){
        if(err) {
            console.error(err);
            throw err;
        }
        else {
            var option = {
                method : "GET",
                url :"https://testapi.open-platform.or.kr/user/me?user_seq_no=" + results[0].userseqnum,
                headers : {
                    "Authorization" : "Bearer " + results[0].accessToken
                }
            };

        request(option, function(err, response, body){
            if(err) throw err;
            else { 
                console.log(body)
                res.json(JSON.parse(body));
            }
        })
        }
    })
})

app.post('/balance', auth, function(req, res) {
    var userId = req.decoded.userId;
    var finNum = req.body.finNum;
    var tran_dtime = "20190523154320";
    var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
    connection.query(sql, [userId], function (err, results){
        if(err) {
            console.error(err);
            throw err;
        }
        else {
            var option = {
                method : "GET",
                url :"https://testapi.open-platform.or.kr/v1.0/account/balance?fintech_use_num=" + results[0].userseqnum + "&tran_dtime=" + tran_dtime,
                headers : {
                    "Authorization" : "Bearer " + results[0].accessToken
                }
            };

        request(option, function(err, response, body){
            if(err) throw err;
            else { 
                console.log(body)
                res.render('balance', {data : JSON.parse(body)});
            }
        })
        }
    })

})

app.post('/transaction_list', auth, function(req, res) {
    var userId = req.decoded.userId;
    var finNum = req.body.finNum;
    var tran_dtime = "20190523154320";
    var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
    connection.query(sql, [userId], function (err, results){
        if(err) {
            console.error(err);
            throw err;
        }
        else {
            var option = {
                method : "GET",
                url :"https://testapi.open-platform.or.kr/v1.0/account/transaction_list?"
                + "fintech_use_num=" + results[0].userseqnum 
                + "&inquiry_type=A" 
                + "&from_data=20160101" 
                + "&to_data=20160101"
                + "&sort_order=A"
                + "&page_index=1"
                + "&tran_dtime=20160101121212",
                headers : {
                    "Authorization" : "Bearer " + results[0].accessToken
                }
            };

        request(option, function(err, response, body){
            if(err) throw err;
            else { 
                console.log(body)
                res.json(JSON.parse(body));
            }
        })
        }
    })
})

app.post('/withdraw', auth, function(req, res) {
    var userId = req.decoded.userId;
    var finNum = req.body.finNum;
    var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
    connection.query(sql, [userId], function (err, results){
        if(err) {
            console.error(err);
            throw err;
        }
        else {
            var option = {
                method : "POST",
                url :"https://testapi.open-platform.or.kr/v1.0/transfer/withdraw",
                headers : {
                    'Authorization' : 'Bearer ' + result[0].accessToken,
                    'Content-Type' : 'application/json; charset=UTF-8'
                },
                json : {
                    dps_print_content : '어준',
                    fintech_use_num : finNum,
                    tran_amt : 1000,
                    print_content : '어준',
                    tran_dtime : '20190523101921'
                }
            }
            request(option, function(err, response, body){
                if(err) throw err;
                else {
                    console.log(body);
                    var requestResult = body
                    if(requestResult.rsp_code == "A0000"){
                        var sql = "UPDATE user set point = point + ? WHERE user_id = ?"
                        connection.query(sql, [requestResult.tran_amt, userId], function(err, result){
                            if(err){
                                console.error(err);
                                throw err;
                            }
                            else {
                                res.json(1);
                            }
                        })
                    }
                }
            })
        }
    })
})

app.get('/balance', function(req, res){
    res.render('balance')
})

app.get('/main', function(req, res) {
    res.render('main')
})

app.get('/tokenTest', auth, function(req, res) {
    //console.log(req.decoded.userName);
    //console.log(req.decoded);
})

app.get('/ajaxTest', function(req, res){
    console.log("ajax call");
    var result = "hello";
    res.json(result);
})

app.listen(3000)