var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');
var md5 = crypto.createHash('md5');        //create hash 

//middleware for check login state
var checkLogin = function(req,res,next) {
    if ( req.session.user && req.session.user.name.toString() === 'taoshen' ) {
        next();
    } else {
        req.flash('error','未登录！')
        res.redirect('/login');
    }
};

//middleware for check logout state
var checkLogout = function(req,res,next) {
    if (  !req.session.user ) {
        next();
    } else {
        req.flash('success','已登录！');
        res.redirect('/');
    }
}


//init the userCollection
// ;(function(){
//     var mongo = require('../models/db');
    
//     //user model for insert into mongo
//     var admin = {
//         name:'taoshen',
//         password:md5.update('123456').digest('hex')
//     };
    
//     mongo.open(function(err,db) {
//         db.collection('users',function(err,collection) {
//             collection.insert(admin,{
//                 safe:true
//             },function(err,aduser) {
//                 if (!err) {
//                     console.log('insert:',aduser);
//                 };
//             });
//         });
//     });
// }());

module.exports = function(app) {
    
    app.get('/',function(req,res) {
        return res.render('index',{
            title:'凤歌',
            name:req.flash('success').toString() || 'world',
            success:req.flash('success').toString(),
            error:req.flash('error').toString()            
        });
    });
    
    app.get('/routest/:sth',function(req,res) {
        req.cookies.name = 'req.params.sth';
        return res.render('routest',{test:req.cookies.name});
    });
    
    app.get('/login',checkLogout);
    app.get('/login',function(req,res) {
        return res.render('login');
    });
    
    app.post('/login',checkLogout);
    app.post('/login',function(req,res) {
        var md5 = crypto.createHash('md5'); 
        var password = md5.update(req.body.password + '').digest('hex');            
        // check user existense
        User.get(req.body.name,function(err,user) {
            console.log('req.body.password:',req.body.password);
            if (!user) {
                // console.log('1');
                req.flash('errer','用户不存在');
                return res.redirect('/login');
            } else if (password !== user.password) {
                // console.log('password:',password,'userpassword:',user.password);
                req.flash('error','密码错误');
                return res.redirect('/login');
            } else if (user && (password === user.password)) {
                req.session.user = user;
                req.flash('success','登录成功！');
                return res.redirect('/');
            };
        });
    });
    
    app.get('/logout',checkLogin);
    app.get('/logout',function(req,res) {
        req.session.user = null;
        req.flash('success','退出成功！');
        res.redirect('/');
    });
    
    app.get('/post',checkLogin);
    app.get('/post',function(req,res) {
        return res.render('post');
    });
    
    app.post('/post',checkLogin);
    app.post('/post',function(req,res) {
        var post = new Post(
            req.body.title,
            req.body.series,
            req.body.tags,
            req.body.content,
            req.body.route
        );
        post.save(function(err) {
            if (err) {
                return console.log(err);
            };
            req.flash('success','发布成功！');
            res.redirect('/');
        });   
    });
    
    app.get('/article/:route',function(req,res) {
        Post.getOne(req.params.route,function(err,doc) {
            //error process
            if ( err ) {
                if ( err === '404') {   //if page not found
                    return res.redirect('/404');
                } else {
                    return console.log(err);
                }
            };
            return res.render('article',{
                    title:doc.title,
                    tags:doc.tags,
                    time:doc.time,
                    content:doc.content,
                    series:doc.series
            });
        });
    });
        
    app.use(function(req,res) {
        return res.redirect('/404');
    });
    
    app.get('/404',function (req,res) {
        return res.render('404');
    });
};




// todo:
//     1.route 与 timeStamp 路由写好........√
//     2.找不到文章后的404页面........√
//     3.错误路径的404处理........√
//     4.标签页和归档页
//     5.前端工作