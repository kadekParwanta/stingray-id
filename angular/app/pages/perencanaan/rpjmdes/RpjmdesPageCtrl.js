/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.perencanaan')
        .controller('RpjmdesPageCtrl', RpjmdesPageCtrl);

    /** @ngInject */
    function RpjmdesPageCtrl($scope, RPJMDes, Bidang) {
        var vm = this;
        $scope.RPJMDesList = [];
        $scope.bidangList = [];
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
                        include: ['Bidang', 'WaktuPelaksanaan', 'SumberBiaya', 'PolaPelaksanaan']
                    }
                }, function (results) {
                    $scope.RPJMDesList = results;
                    populateRPJMDes(results);
                })
        }

        function populateRPJMDes(data) {
            angular.forEach(data, function (rpjmdes) {
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

        function getBidangList() {
            Bidang
                .find()
                .$promise
                .then(function (results) {
                    $scope.bidangList = results;
                });
        };

        getBidangList();
        getRPJMDesList();
    }

})();
