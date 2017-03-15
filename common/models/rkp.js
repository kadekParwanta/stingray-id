'use strict';

module.exports = function (Rkp) {
    var app = require('../../server/server');

    Rkp.beforeRemote('create', function (ctx, issue, next) {
        ctx.args.data.createdDate = new Date();
        var Counter = app.models.Counter;
        var BidangId = ctx.args.data.BidangId;
        var RPJMDesId = ctx.args.data.RPJMDesId;
        var parentId;
        if (BidangId) {
            parentId = BidangId;
        } else if (RPJMDesId) {
            parentId = RPJMDesId;
        }

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
            var parentId;
            if (BidangId) {
                parentId = BidangId;
            } else if (RPJMDesId) {
                parentId = RPJMDesId;
            }
            MongoConnector.collection('Counter').findAndModify(
                { collection: parentId.toHexString() },
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
