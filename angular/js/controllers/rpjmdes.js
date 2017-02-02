// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
    .module('app')
    .controller('RPJMDesController', ['$scope', '$state', 'RPJMDes', function ($scope,
        $state, RPJMDes) {
        $scope.RPJMDesList = [];
        function getRPJMDesList() {
            RPJMDes
                .find()
                .$promise
                .then(function (results) {
                    $scope.RPJMDesList = results;
                });
        }
        getRPJMDesList();

        $scope.addRPJMDes = function () {
            $scope.newRPJMDes.Tahun = $scope.year;
            RPJMDes
                .create($scope.newRPJMDes)
                .$promise
                .then(function (school) {
                    $scope.newRPJMDes = '';
                    $scope.RPJMDesForm.SubBidang.$setPristine();
                    $scope.RPJMDesForm.Jenis.$setPristine();
                    $scope.RPJMDesForm.Lokasi.$setPristine();
                    $scope.RPJMDesForm.PrakiraanVolume.$setPristine();
                    $scope.RPJMDesForm.Sasaran.$setPristine();
                    $scope.RPJMDesForm.Tahun.$setPristine();
                    $('.focus').focus();
                    getRPJMDesList();
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