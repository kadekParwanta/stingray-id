'use strict';

module.exports = function (Rpjm) {
    var Promise = require('bluebird');

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

                Promise.all(promises).then(function(rpjmList){
                    next();
                })
            });
        } else {
            next();
        }
    });
};
