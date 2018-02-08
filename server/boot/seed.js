'use strict';
module.exports = function (app) {
    var User = app.models.user;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;
    // Create admin user
    User.find({ where: { 'email': 'admin@sidesa.com' } }, function (err, users) {
        if (users.length <= 0) {
            User.create(
                {
                    username: 'admin.sidesa',
                    firstName: 'Admin',
                    lastName: 'Sidesa',
                    email: 'admin@sidesa.com',
                    password: 'password',
                }, function (err, user) {
                    if (err) throw err;
                    console.log('Created User:', user);

                    // Create role admin
                    createRole('admin', user, function (err, res) {
                        if (err) throw err;
                    });
                });
        } else {
            users[0].updateAttributes({
                username: 'admin.sidesa',
                firstName: 'Admin',
                lastName: 'Sidesa',
                email: 'admin@sidesa.com',
                password: 'password',
            }, function (err, user) {
                if (err) throw err;
                console.log('Update User:', user);
                createRole('admin', user, function (err, res) {
                    if (err) throw err;
                });
            });
        }
    });

    // Create kaur user
    User.find({ where: { 'email': 'kaur@sidesa.com' } }, function (err, users) {
        if (users.length <= 0) {
            User.create(
                {
                    username: 'kaur',
                    firstName: 'Kaur',
                    lastName: 'Sidesa',
                    email: 'kaur@sidesa.com',
                    password: 'password',
                }, function (err, user) {
                    if (err) throw err;
                    console.log('Created User:', user);

                    // Create role admin
                    createRole('kaur', user, function (err, res) {
                        if (err) throw err;
                    });
                });
        } else {
            users[0].updateAttributes({
                username: 'kaur',
                firstName: 'Kaur',
                lastName: 'Sidesa',
                email: 'kaur@sidesa.com',
                password: 'password',
            }, function (err, user) {
                if (err) throw err;
                console.log('Update User:', user);
                createRole('kaur', user, function (err, res) {
                    if (err) throw err;
                });
            });
        }
    });

    // Create kaur user
    User.find({ where: { 'email': 'penduduk@sidesa.com' } }, function (err, users) {
        if (users.length <= 0) {
            User.create(
                {
                    username: 'penduduk',
                    firstName: 'Penduduk',
                    lastName: 'Sidesa',
                    email: 'penduduk@sidesa.com',
                    password: 'password',
                }, function (err, user) {
                    if (err) throw err;
                    console.log('Created User:', user);

                    // Create role admin
                    createRole('penduduk', user, function (err, res) {
                        if (err) throw err;
                    });
                });
        } else {
            users[0].updateAttributes({
                username: 'penduduk',
                firstName: 'Penduduk',
                lastName: 'Sidesa',
                email: 'penduduk@sidesa.com',
                password: 'password',
            }, function (err, user) {
                if (err) throw err;
                console.log('Update User:', user);
                createRole('penduduk', user, function (err, res) {
                    if (err) throw err;
                });
            });
        }
    });

    function createRole(name, user, cb) {
        Role.find({ where: { 'name': name } }, function (err, roles) {
            if (roles.length <= 0) {
                Role.create({
                    name: name,
                }, function (err, role) {
                    if (err) cb(err);
                    console.log('Created role:', role);
                    createPrincipals(role, user, cb);
                });
            } else {
                console.log('Role ' + name + ' already exist');
                var role = roles[0];
                createPrincipals(role, user, cb);
            }
        });
    }

    function createPrincipals(role, user, cb) {
        role.principals({
            where: {
                principalId: user.id,
                principalType: RoleMapping.USER,
            },
        }, function (err, principals) {
            if (principals.length <= 0) {
                role.principals.create({
                    principalType: RoleMapping.USER,
                    principalId: user.id,
                }, function (err, principal) {
                    if (err) cb(err);
                    console.log('Created principal:', principal);
                    cb(null, principal);
                });
            } else {
                console.log('Principal ' + user.id + ' already exist');
                cb(null, principals[0]);
            }
        });
    }
}
