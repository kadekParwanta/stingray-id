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
            createWaktuPelaksanaan(ctx, function(err, data){
                createPolaPelaksanaan(ctx, function(err, data){
                    createSumberBiayaItem(ctx, function(err, data){
                        createPendapatan(ctx, function(err, data){
                            createBiaya(ctx, cb);
                        });
                    });
                });
            });
                
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

    function createSumberBiayaItem(ctx, cb) {
        var SumberBiayaItem = app.models.SumberBiayaItem;
        if (ctx.isNewInstance) {
            SumberBiayaItem.create([
                {"Nama": "Pendapatan Asli Desa", "RPJMId": ctx.instance.id },
                {"Nama": "Alokasi Dana Desa", "RPJMId": ctx.instance.id },
                {"Nama": "Dana Desa", "RPJMId": ctx.instance.id },
                {"Nama": "Bantuan Keuangan Provinsi", "RPJMId": ctx.instance.id },
                {"Nama": "Bantuan Keuangan Kabupaten", "RPJMId": ctx.instance.id },
                {"Nama": "Bagi Hasil Pajak dan Retribusi", "RPJMId": ctx.instance.id },
                {"Nama": "Swadaya Masyarakat", "RPJMId": ctx.instance.id },
                {"Nama": "Pendapatan lain lain yang sah", "RPJMId": ctx.instance.id }
            ], cb)
        } else {
            cb(null, false);
        }
    }

    function createPendapatan(ctx, cb) {
        var Pendapatan = app.models.Pendapatan;
        var SubPendapatan = app.models.SubPendapatan;
        if (ctx.isNewInstance) {
            Pendapatan.create(
                { "No": 1, "Nama": "Pendapatan Asli Desa", "RPJMId": ctx.instance.id }, function (err, pendapatanA) {
                    pendapatanA.SubPendapatan.create([
                        { "No": 1, "Nama": "Hasil Usaha" },
                        { "No": 2, "Nama": "Hasil Aset" },
                        { "No": 3, "Nama": "Swadaya, partisipasi, dan gotong royong" },
                        { "No": 4, "Nama": "Lain-lain pendapatan asli desa" }
                    ], function (err, subpendapatanA) {
                        Pendapatan.create(
                            { "No": 2, "Nama": "Pendapatan Transfer", "RPJMId": ctx.instance.id }, function (err, pendapatanB) {
                                pendapatanB.SubPendapatan.create([
                                    { "No": 1, "Nama": "Dana Desa" },
                                    { "No": 2, "Nama": "Bagian dari Hasil Pajak dan Retribusi Daerah Kabupaten" },
                                    { "No": 3, "Nama": "Alokasi Dana Desa(ADD)" },
                                    { "No": 4, "Nama": "Bantuan Keuangan Provinsi" },
                                    { "No": 5, "Nama": "Bantuan Keuangan Kabupaten" }
                                ], function (err, subpendapatanB) {
                                    Pendapatan.create(
                                        { "No": 3, "Nama": "Pendapatan Lain-lain", "RPJMId": ctx.instance.id }, function (err, pendapatanC) {
                                            pendapatanC.SubPendapatan.create([
                                                { "No": 1, "Nama": "Hibah dan sumbangan dari Pihak Ketiga yang Tidak Mengikat" },
                                                { "No": 2, "Nama": "Lain-lain pendapatan desa yang sah" }
                                            ], function (err, subpendapatanC) {
                                                cb(null, false);
                                            })
                                        }
                                    )
                                })
                            }
                        )
                    })
                })
        } else {
            cb(null, false);
        }
    }

    function createBiaya(ctx, cb) {
        var Biaya = app.models.Biaya;
        if (ctx.isNewInstance) {
            Biaya.create(
                { "No": 1, "Nama": "Penerimaan Pembiayaan", "isAdd":true, "RPJMId": ctx.instance.id }, function (err, biayaA) {
                    biayaA.SubBiaya.create([
                        { "No": 1, "Nama": "Sisa lebih perhitungan anggaran (SiLPA) tahun sebelumnya" },
                        { "No": 2, "Nama": "Pencairan Dana Cadangan" },
                        { "No": 3, "Nama": "Hasil Kekayaan Desa yang dipisahkan" }
                    ], function (err, subbiayaA) {
                        Biaya.create(
                            { "No": 2, "Nama": "Pengeluaran Pembiayaan", "isAdd":false, "RPJMId": ctx.instance.id }, function (err, biayaB) {
                                biayaB.SubBiaya.create([
                                    { "No": 1, "Nama": "Pembentukan Dana Cadangan" },
                                    { "No": 2, "Nama": "Penyertaan Modal Desa" }
                                ], function (err, subpendapatanB) {
                                    cb(null, false);
                                })
                            }
                        )
                    })
                })
        } else {
            cb(null, false);
        }
    }
};
