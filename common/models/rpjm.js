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
                    createRelationsData(ctx, function (err, data) {
                        next();
                    })
                })
            });
        } else {
            createRelationsData(ctx, function (err, data) {
                next();
            })
        }
    });

    function createRelationsData(ctx, cb){
        createBidang(ctx, function(err, data){
            createWaktuPelaksanaan(ctx, cb);
        })
    }

    function createBidang(ctx, cb) {
        var Bidang = app.models.Bidang;
        if (ctx.isNewInstance) {
            Bidang.create([
                { "No": 1, "Nama": "Penyelenggaraan Pemerintahan Desa", "RPJMId": ctx.instance.id },
                { "No": 2, "Nama": "Pelaksanaan Pembangunan Desa", "RPJMId": ctx.instance.id },
                { "No": 3, "Nama": "Pembinaan Kemasyarakatan Desa", "RPJMId": ctx.instance.id },
                { "No": 4, "Nama": "Pemberdayaan Masyarakat Desa", "RPJMId": ctx.instance.id }
            ], cb)
        } else {
            cb(null, false);
        }
    }

    function createWaktuPelaksanaan(ctx, cb) {
        var WaktuPelaksanaan = app.models.WaktuPelaksanaan;
        var TahunMulai = parseInt(ctx.instance.TahunMulai);
        var TahunSelesai = parseInt(ctx.instance.TahunSelesai);

        var delta = TahunSelesai - TahunMulai;
        var data = [];
        for (var i=0; i<= delta; i++) {
            var nama = TahunMulai + i;
            var no = i+1;
            data.push({"No":no, "Nama": nama, "RPJMId": ctx.instance.id });
        }

        if (ctx.isNewInstance) {
            WaktuPelaksanaan.create(data, cb)
        } else {
            cb(null, false);
        }
    }

    function createPolaPelaksanaan(ctx, cb) {
        var PolaPelaksanaan = app.models.PolaPelaksanaan;
        if (ctx.isNewInstance) {
            PolaPelaksanaan.create([
                {"Nama": "Swakelola", "RPJMId": ctx.instance.id },
                {"Nama": "Kerja Sama", "RPJMId": ctx.instance.id },
                {"Nama": "Pihak Ketiga", "RPJMId": ctx.instance.id }
            ], cb)
        } else {
            cb(null, false);
        }
    }
};
