'use strict';

module.exports = function(Anggaranpendapatan) {
    var app = require('../../server/server');
    
    Anggaranpendapatan.beforeRemote('create', function (ctx, issue, next) {
        ctx.args.data.createdDate = new Date();
        var Counter = app.models.Counter;
        var SubPendapatanId = ctx.args.data.SubPendapatanId;
        var WaktuPelaksanaanId = ctx.args.data.WaktuPelaksanaanId;
        var parentId = SubPendapatanId + "-" + WaktuPelaksanaanId;

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

    Anggaranpendapatan.observe('before save', function (ctx, next) {
        var MongoDB = app.dataSources.mongodb;
        var MongoConnector = MongoDB.connector;
        if (ctx.isNewInstance) {
            var SubPendapatanId = ctx.instance.__data.SubPendapatanId.toHexString();
            var WaktuPelaksanaanId = ctx.instance.__data.WaktuPelaksanaanId.toHexString();
            var parentId = SubPendapatanId + "-" + WaktuPelaksanaanId;

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
};
