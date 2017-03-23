module.exports = function (Waktupelaksanaan) {

    Waktupelaksanaan.jumlahPendapatan = function (id, cb) {
        Waktupelaksanaan.findById(id, function (err, waktuPelaksanaan) {
            waktuPelaksanaan.AnggaranPendapatan(function (err, anggaran) {
                var jumlah = 0;
                anggaran.forEach(function (item) {
                    jumlah += item.Jumlah;
                })

                cb(null, jumlah);
            })
        })

    }

    Waktupelaksanaan.remoteMethod(
        'jumlahPendapatan',
        {
            accepts: [
                { arg: 'id', type: 'string', required: true }
            ],
            http: { path: '/:id/jumlahPendapatan', verb: 'get' },
            returns: { arg: 'JumlahPendapatan', type: 'number' }
        }
    );

    Waktupelaksanaan.jumlahBiaya = function (id, cb) {
        Waktupelaksanaan.findById(id, function (err, waktuPelaksanaan) {
            waktuPelaksanaan.AnggaranBiaya(function (err, biaya) {
                var jumlah = 0;
                biaya.forEach(function (item) {
                    jumlah += item.Jumlah;
                })

                cb(null, jumlah);
            })
        })

    }

    Waktupelaksanaan.remoteMethod(
        'jumlahBiaya',
        {
            accepts: [
                { arg: 'id', type: 'string', required: true }
            ],
            http: { path: '/:id/jumlahBiaya', verb: 'get' },
            returns: { arg: 'JumlahBiaya', type: 'number' }
        }
    );
};
