var mongodb = require('./db');
var markdown = require('markdown').markdown;

var Post = function(title,series,tags,content,route) {
    this.title = title;
    this.series = series;
    this.tags = tags;
    this.content = content;
    this.route = route;
};

module.exports = Post;

Post.prototype.save = function(callback) {
    var date = new Date();
    var time = {
        year:date.getFullYear(),
        month:date.getMonth() + 1,
        day:date.getDate(),
        hour:date.getHours(),
        minute:date.getMinutes()        
    };    
    var post = {
        title:this.title,
        time:time,
        timeStamp:date.getTime(),
        series:this.series,
        tags:this.tags,
        content:this.content,
        route:this.route
    };
    
    mongodb.open(function(err,db) {
        if (err) {
            mongodb.close();
            return callback(err);
        };
        db.collection('posts',function(err,collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            };
            collection.insert(post,{
                safe:true
            },function(err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                };
                callback(null);
            });
        });
    });
};


// Post.prototype.update = function(callback) {
//     var date = new Date();
//     var time = {
//         year:date.getFullYear(),
//         month:date.getMonth() + 1,
//         day:date.getDate(),
//         hour:date.getHours(),
//         minute:date.getMinutes()        
//     };    
//     var post = {
//         title:this.title,
//         time:time,
//         timeStamp:date.getTime(),
//         series:this.series,
//         tags:this.tags,
//         content:this.content,
//         route:this.route
//     };
    
//     mongodb.open(function(err,db) {
//         if (err) {
//             mongodb.close();
//             return callback(err);
//         };
//         db.collection('posts',function(err,collection) {
//             if (err) {
//                 mongodb.close();
//                 return callback(err);
//             };
//             collection.insert(post,{
//                 safe:true
//             },function(err) {
//                 mongodb.close();
//                 if (err) {
//                     return callback(err);
//                 };
//                 callback(null);
//             });
//         });
//     });    
// };


Post.getOne = function(route,callback) {
    // if (route) {
        mongodb.open(function(err,db) {
            if (err) {
                mongodb.close();
                return callback(err);
            };
            db.collection('posts',function(err,collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                };
                collection.findOne({
                    route:route,
                },function(err,doc) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    };
                    if (doc){   
                        doc.content = markdown.toHTML(doc.content);
                        callback(null,doc); 
                    } else {    //if page not found
                        callback('404');
                    }
                    
                });
            });
        });
    // };
};

Post.getSome = function(page,callback) {
    var articlePerPage = 15;    //show 15 articles per page
    mongodb.open(function(err,db) {
        if (err) {
            mongodb.close();
            return callback(err);
        };
        db.collection('posts',function(err,collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            };
            collection.find({},{
                skip:(page - 1)　* articlePerPage,
                limit:articlePerPage
            }).sort({
                time:-1    //reverse the order of result by time
            }).toArray(function(err,docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                };
                for ( doc in docs ) {
                    doc.content = markdown.toHTML(doc.content);
                };
                callback(null,docs);
            });
        });
    });
};


Post.edit = function(route,callback) {
    mongodb.open(function(err,db) {
            if (err) {
                mongodb.close();
                return callback(err);
            };
            db.collection('posts',function(err,collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                };
                collection.findOne({
                    route:route,
                },function(err,doc) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    };
                    if (doc){   
                        callback(null,doc); 
                    } else {    //if page not found
                        callback('404');
                    };                    
                });
            });
        });
};


Post.update = function(route,post,callback) {
    mongodb.open(function(err,db) {
        if (err) {
            mongodb.close();
            return callback(err);
        };
        db.collection('posts',function(err,collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            };
            collection.update({
                'route':route
            },{
                $set:{
                    title:post.title,
                    series:post.series,
                    tags:post.tags,
                    content:post.content
                }
              },function(err) {
                    mongodb.close();
                    if (err) {
                        return callback('404');
                    };
                    callback(null);
                });
        });
    });
    
};