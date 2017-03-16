'use strict';

module.exports = function(Rab) {
    var app = require('../../server/server');
    
    Rab.beforeRemote('create', function (ctx, issue, next) {
        ctx.args.data.createdDate = new Date();
        var Counter = app.models.Counter;
        var BelanjaId = ctx.args.data.BelanjaId;

        // Create counter with projectId as the collection name if not exist
        Counter.findOne({ where: { collection: BelanjaId } }, function (err, counter) {
            if (!counter) {
                Counter.create({ collection: BelanjaId, value: 0 }, function (err, instance) {
                    next();
                })
            } else {
                next();
            }
        })

    })

    Rab.observe('before save', function (ctx, next) {
        var MongoDB = app.dataSources.mongodb;
        var MongoConnector = MongoDB.connector;
        if (ctx.isNewInstance) {
            var BelanjaId = ctx.instance.__data.BelanjaId;

            MongoConnector.collection('Counter').findAndModify(
                { collection: BelanjaId.toHexString() },
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
