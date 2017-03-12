'use strict';

module.exports = function (Rpjm) {
    var Promise = require('bluebird');
    var app = require('../../server/server')

    Rpjm.validatesUniquenessOf('TahunMulai');

    Rpjm.observe('after save', function (ctx, next) {
        var IsActive = ctx.instance.IsActive;
        var id = ctx.instance.id;
        if (IsActive) {
            Rpjm.find({ where: { "IsActive": true } }, function (err, rpjmList) {
                var promises = rpjmList.map(function (rpjm) {
                    return new Promise(function (resolve, reject) {
                        if (!rpjm.__data.id.equals(id)) {
                            rpjm.updateAttribute("IsActive", false, function (err, rpjmData) {
                                resolve(rpjmData);
                            })
                        } else {
                            resolve(rpjm);
                        }
                    })
                })

                Promise.all(promises).then(function (rpjmList) {
                    createBidang(ctx, function (err, bidangList) {
                        next();
                    })
                })
            });
        } else {
            createBidang(ctx, function (err, bidangList) {
                next();
            })
        }
    });

    function createBidang(ctx, cb) {
        var Bidang = app.models.Bidang;
        if (ctx.isNewInstance) {
            Bidang.create([
                { "No": 1, "Nama": "Bidang1", "RPJMId": ctx.instance.id },
                { "No": 2, "Nama": "Bidang2", "RPJMId": ctx.instance.id },
                { "No": 3, "Nama": "Bidang3", "RPJMId": ctx.instance.id },
                { "No": 4, "Nama": "Bidang4", "RPJMId": ctx.instance.id }
            ], cb)
        } else {
            cb(null, false);
        }
    }
};
