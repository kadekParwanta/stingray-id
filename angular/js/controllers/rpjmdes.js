// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
    .module('app')
    .controller('RPJMDesController', ['$scope', '$state', 'RPJMDes', 'Bidang', 'WaktuPelaksanaan','$q', 'SumberBiaya', 'PolaPelaksanaan', function ($scope,
        $state, RPJMDes, Bidang, WaktuPelaksanaan, $q, SumberBiaya, PolaPelaksanaan) {
        $scope.RPJMDesList = [];
        $scope.selectedBidang;
        $scope.waktuPelaksanaanList = [];
        $scope.selectedWaktuPelaksanaan = [];
        $scope.sumberBiaya = {};
        $scope.selectedPolaPelaksanaan = [];
        $scope.Bidang1 = [];
        $scope.Bidang1Total = 0;
        $scope.Bidang2 = [];
        $scope.Bidang2Total = 0;
        $scope.Bidang3 = [];
        $scope.Bidang3Total = 0;
        $scope.Bidang4 = [];
        $scope.Bidang4Total = 0;

        function getRPJMDesList() {
            RPJMDes
                .find({
                    filter: {
                        include: ['Bidang','WaktuPelaksanaan','SumberBiaya', 'PolaPelaksanaan']
                    }
                }, function (results) {
                    $scope.RPJMDesList = results;
                    populateRPJMDes(results);
                })
        }

        function populateRPJMDes(data) {
            angular.forEach(data, function(rpjmdes){
                var bidang = rpjmdes.Bidang;
                if (bidang.No === 1) {
                    $scope.Bidang1.push(rpjmdes);
                    if (rpjmdes.SumberBiaya) {
                        var jumlah = rpjmdes.SumberBiaya.Jumlah | 0;
                        $scope.Bidang1Total += jumlah;
                    } 
                } else if (bidang.No === 2) {
                    $scope.Bidang2.push(rpjmdes);
                    if (rpjmdes.SumberBiaya) {
                        var jumlah = rpjmdes.SumberBiaya.Jumlah | 0;
                        $scope.Bidang2Total += jumlah;
                    }
                } else if (bidang.No === 3) {
                    $scope.Bidang3.push(rpjmdes);
                    if (rpjmdes.SumberBiaya) {
                        var jumlah = rpjmdes.SumberBiaya.Jumlah | 0;
                        $scope.Bidang3Total += jumlah;
                    }
                } else if (bidang.No === 4) {
                    $scope.Bidang4.push(rpjmdes);
                    if (rpjmdes.SumberBiaya) {
                        var jumlah = rpjmdes.SumberBiaya.Jumlah | 0;
                        $scope.Bidang4Total += jumlah;
                    }
                }
            })
        }

        getRPJMDesList();



        function assignWaktuPelaksanaan(rpjmdes, waktuPelaksanaanList) {
            var promises = waktuPelaksanaanList.map(function (waktuPelaksanaan) {
                var deferred = $q.defer();
                RPJMDes.WaktuPelaksanaan.link({ id: rpjmdes.id, fk: waktuPelaksanaan.id }, null, function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            });
            return $q.all(promises);
        }

        function assignPolaPelaksanaan(rpjmdes, polaPelaksanaanList) {
            var promises = polaPelaksanaanList.map(function (polaPelaksanaan) {
                var deferred = $q.defer();
                RPJMDes.PolaPelaksanaan.link({ id: rpjmdes.id, fk: polaPelaksanaan.id }, null, function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            });
            return $q.all(promises);
        }

        $scope.addRPJMDes = function () {
            $scope.newRPJMDes.Tahun = $scope.year;
            $scope.newRPJMDes.BidangId = $scope.selectedBidang.id;

            RPJMDes
                .create($scope.newRPJMDes)
                .$promise
                .then(function (rpjmdes) {
                    $scope.newRPJMDes = '';
                    $scope.RPJMDesForm.SubBidang.$setPristine();
                    $scope.RPJMDesForm.Jenis.$setPristine();
                    $scope.RPJMDesForm.Lokasi.$setPristine();
                    $scope.RPJMDesForm.PrakiraanVolume.$setPristine();
                    $scope.RPJMDesForm.Sasaran.$setPristine();
                    $('.focus').focus();
                    if ($scope.selectedWaktuPelaksanaan.length > 0) {
                        assignWaktuPelaksanaan(rpjmdes, $scope.selectedWaktuPelaksanaan).then(function () {
                            $scope.addSumberBiaya(rpjmdes.id, function (data) {
                                if ($scope.selectedPolaPelaksanaan.length > 0) {
                                    assignPolaPelaksanaan(rpjmdes, $scope.selectedPolaPelaksanaan).then(function () {
                                        getRPJMDesList();
                                    })
                                } else {
                                    getRPJMDesList();
                                }
                            })

                        })
                    } else {
                        $scope.addSumberBiaya(rpjmdes.id, function (data) {
                            getRPJMDesList();
                        })
                    }


                });
        };

        $scope.removeRPJMDes = function (item) {
            RPJMDes
                .deleteById(item)
                .$promise
                .then(function () {
                    getRPJMDesList();
                });
        };

        $scope.addSumberBiaya = function (id, cb) {
            if ($scope.sumberBiaya) {
                SumberBiaya.create({
                    Jumlah: $scope.sumberBiaya.Jumlah,
                    Sumber: $scope.sumberBiaya.Sumber,
                    rPJMDesId: id
                }, cb)
            } else {
                return cb("");
            }

        }

        $scope.bidangList = [];
        function getBidangList() {
            Bidang
                .find()
                .$promise
                .then(function (results) {
                    $scope.bidangList = results;
                });
        };

        getBidangList();

        function getWaktuPelaksanaanList() {
            WaktuPelaksanaan
                .find()
                .$promise
                .then(function (results) {
                    $scope.waktuPelaksanaanList = results;
                });
        }
        getWaktuPelaksanaanList();

        $scope.polaPelaksanaanList = [];
        function getPolaPelaksanaanList() {
            PolaPelaksanaan
                .find()
                .$promise
                .then(function (results) {
                    $scope.polaPelaksanaanList = results;
                });
        };

        getPolaPelaksanaanList();

        $scope.$watch('selected', function (nowSelected) {
            // reset to nothing, could use `splice` to preserve non-angular references
            $scope.selectedWaktuPelaksanaan = [];

            if (!nowSelected) {
                // sometimes selected is null or undefined
                return;
            }

            // here's the magic
            angular.forEach(nowSelected, function (val) {
                $scope.selectedWaktuPelaksanaan.push(val);
            });
        });

        $scope.today = function () {
            $scope.year = new Date();
        };

        $scope.today();

        $scope.clear = function () {
            $scope.year = null;
        };

        $scope.open = function ($event) {
            $scope.status.opened = true;
        };

        $scope.setDate = function (year, month, day) {
            $scope.year = new Date(year, month, day);
        };

        $scope.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1,
            minMode: 'year'
        };

        $scope.formats = ['yyyy'];
        $scope.format = $scope.formats[0];

        $scope.status = {
            opened: false
        };

    }]);