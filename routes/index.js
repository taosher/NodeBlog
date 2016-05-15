
/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user');


//init the userCollection
;(function(){
    var mongo = require('../models/db');
    
    //user model for insert into mongo
    var admin = {
        name:'taoshen',
        password:'123456'
    };
    
    mongo.open(function(err,db) {
        db.collection('users',function(err,collection) {
            collection.insert(admin,{
                safe:true
            },function(err,aduser) {
                if (!err) {
                    console.log('insert:',aduser);
                };
            });
        });
    });
}());

module.exports = function(app) {
    app.get('/',function(req,res) {
        req.session.user = 'wqeqweqw';
        res.render('index',{title:'BlogTest',name:'Mark'});
    });
    
    app.get('/routest/:sth',function(req,res) {
        req.cookies.name = 'req.params.sth';
        res.render('routest',{test:req.cookies.name});
    });
    
    app.get('/login',function(req,res) {
        res.render('login');
    });
    
    app.post('/login',function(req,res) {
        
        //create hash
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
            
        // check user existense
        User.get(req.body.name,function(err,user) {
            if (!user) {
                req.flash('errer','用户不存在');
                return req.redirect('/login');
            };
            
        })
    })
};
