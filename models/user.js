var mongodb = require('./db');

var User = function(user) {
    this.name = user.name;
    this.acccout = user.account;
    this.password = user.password;
};

User.get = function(name,callback) {
    mongodb.open(function(err,db) {
        //error process
        if (err) {
            mongodb.close();
            return callback(err);
        };
        db.collection('users',function(err,collection) {
            //error process
            if (err) {
                mongodb.close();
                return callback(err);
            };
            collection.findOne({
                name:name
            },function(err,user) {
                mongodb.close();
                //error process
                if (err) {
                    return callback(err);
                };
                callback(null,user);
            });
        });
    });
};

module.exports = User;