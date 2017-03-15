module.exports = function(Rpjmdes) {
    var app = require('../../server/server');
    Rpjmdes.beforeRemote('create', function (ctx, issue, next) {
        ctx.args.data.createdDate = new Date();
        var Counter = app.models.Counter;
        // Create counter with projectId as the collection name if not exist
        Counter.findOne({ where: { collection: ctx.args.data.BidangId } }, function (err, counter) {
            if (!counter) {
                Counter.create({ collection: ctx.args.data.BidangId, value: 0 }, function (err, instance) {
                    next();
                })
            } else {
                next();
            }
        })
        
    })

    Rpjmdes.observe('before save', function (ctx, next) {
        var MongoDB = app.dataSources.mongodb;
        var MongoConnector = MongoDB.connector;
        if (ctx.isNewInstance) {            
            MongoConnector.collection('Counter').findAndModify(
                { collection: ctx.instance.__data.BidangId.toHexString()},
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
