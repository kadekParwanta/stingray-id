// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
    .module('app')
    .controller('SettingController', ['$scope', '$state', 'RPJM', function ($scope,
        $state, RPJM) {

        $scope.newRPJM = {IsActive:true};
        $scope.RPJMList = [];
        $scope.TahunMulai;
        $scope.TahunSelesai;

        init();

        $scope.addRPJM = function () {
            $scope.newRPJM.TahunMulai = $scope.TahunMulai.getFullYear();
            $scope.newRPJM.TahunSelesai = $scope.TahunSelesai.getFullYear();
            RPJM.create($scope.newRPJM, function (rpjm) {
                getRPJMList();
            })
        }

        $scope.removeRPJM = function (item) {
            RPJM.deleteById(item, function () {
                    getRPJMList();
                });
        };

        function getRPJMList () {
            RPJM.find(function (rpjmlist) {
                $scope.RPJMList = rpjmlist;
            })
        }

        function init() {
            getRPJMList();
        }

        $scope.today = function () {
            $scope.TahunMulai = new Date();
            $scope.TahunSelesai = new Date();
            $scope.TahunSelesai.setFullYear($scope.TahunSelesai.getFullYear() + 6);
        };

        $scope.today();

        $scope.clear = function () {
            $scope.TahunMulai = null;
            $scope.TahunSelesai = null;
        };

        $scope.openTahunMulai = function ($event) {
            $scope.statusTahunMulai.opened = true;
        };
        $scope.openTahunSelesai = function ($event) {
            $scope.statusTahunSelesai.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1,
            minMode: 'year'
        };

        $scope.formats = ['yyyy'];
        $scope.format = $scope.formats[0];

        $scope.statusTahunMulai = {
            opened: false
        };
        $scope.statusTahunSelesai = {
            opened: false
        };
    }]);