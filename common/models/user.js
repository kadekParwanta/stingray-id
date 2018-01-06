'use strict';

module.exports = function(User) {
    User.changePassword = function(id, oldPassword, newPassword, cb) {
        User.findById(id, function(err, user) {
          var userResponse = user;
          if (userResponse.password === oldPassword) {
            user.updateAttributes({'password': newPassword},
            function(err, userInstance) {
              if (err) cb(err);
              cb(null, result);
            });
          }
        });
      };
    
      User.remoteMethod('changePassword', {
        accepts: [
                {arg: 'id', type: 'string', required: true},
                {arg: 'oldPassword', type: 'string', required: true},
                {arg: 'newPassword', type: 'string', required: true},
        ],
        returns: {arg: 'User', type: 'object', root: true},
        http: {path: '/:id/changePassword', verb: 'post'},
      });
}