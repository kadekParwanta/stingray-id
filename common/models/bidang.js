module.exports = function(Bidang) {
    Bidang.validatesUniquenessOf('No', {scopedTo:['RPJMId']});
};
