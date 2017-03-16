'use strict';

module.exports = function (Rkp) {
    var app = require('../../server/server');

    Rkp.beforeRemote('create', function (ctx, issue, next) {
        ctx.args.data.createdDate = new Date();
        var Counter = app.models.Counter;
        var BidangId = ctx.args.data.BidangId;
        var RPJMDesId = ctx.args.data.RPJMDesId;
        var WaktuPelaksanaanId = ctx.args.data.WaktuPelaksanaanId;
        var parentId;
        if (BidangId) {
            parentId = BidangId;
        } else if (RPJMDesId) {
            parentId = RPJMDesId;
        }

        parentId = parentId + "-" + WaktuPelaksanaanId;

        // Create counter with projectId as the collection name if not exist
        Counter.findOne({ where: { collection: parentId } }, function (err, counter) {
            if (!counter) {
                Counter.create({ collection: parentId, value: 0 }, function (err, instance) {
                    next();
                })
            } else {
                next();
            }
        })

    })

    Rkp.observe('before save', function (ctx, next) {
        var MongoDB = app.dataSources.mongodb;
        var MongoConnector = MongoDB.connector;
        if (ctx.isNewInstance) {
            var BidangId = ctx.instance.__data.BidangId;
            var RPJMDesId = ctx.instance.__data.RPJMDesId;
            var WaktuPelaksanaanId = ctx.instance.__data.WaktuPelaksanaanId.toHexString();

            var parentId;
            if (BidangId) {
                parentId = BidangId.toHexString();
            } else if (RPJMDesId) {
                parentId = RPJMDesId.toHexString();
            }
            
            parentId = parentId + "-" + WaktuPelaksanaanId;

            MongoConnector.collection('Counter').findAndModify(
                { collection: parentId },
                [['_id', 'asc']],
                { $inc: { value: 1 } },
                { new: true },
                function (err, sequence) {
                    
                    if (err) {
                        next();
                    } else {
                        ctx.instance.No = sequence.value.value;
                        next();
                    }
                })
        } else {
            next();
        }

    });

    Rkp.observe('after save', function (ctx, next) {
        createBelanja(ctx, function(err, data){
            next();
        });
    });

    function createBelanja(ctx, cb) {
        var Belanja = app.models.Belanja;
        if (ctx.isNewInstance) {
            Belanja.create([
                { "No": 1, "Nama": "Belanja Pegawai", "RKPId": ctx.instance.id },
                { "No": 2, "Nama": "Belanja Barang dan Jasa", "RKPId": ctx.instance.id },
                { "No": 3, "Nama": "Belanja Modal", "RKPId": ctx.instance.id },
            ], cb)
        } else {
            cb(null, false);
        }
    }
};
