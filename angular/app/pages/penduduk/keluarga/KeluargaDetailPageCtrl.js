/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.penduduk')
        .controller('KeluargaDetailPageCtrl', KeluargaDetailPageCtrl);

    /** @ngInject */
    function KeluargaDetailPageCtrl($scope, keluargaId, Keluarga, $state) {
        var vm = this;
        $scope.keluarga;
        $scope.tanggalBerlaku;
        if (keluargaId != 0) {
            getKeluargaById(keluargaId);
        }

        function getKeluargaById(id) {
            Keluarga.findById({ id: id, filter: { include: ['AnggotaKeluarga', 'KepalaKeluarga'] } }
                ,function (keluarga) {
                    $scope.keluarga = keluarga;
                    $scope.tanggalBerlaku = new Date(keluarga.TanggalBerlaku);
                })
        }

        $scope.editKeluarga = function(keluarga){
            if (keluarga.id) {
                Keluarga.prototype$updateAttributes({
                    id: keluarga.id,
                    NoKK: keluarga.NoKK,
                    Alamat: keluarga.Alamat,
                    TanggalBerlaku: $scope.tanggalBerlaku
                }, function(res){
                    $state.go('penduduk');
                })
            } else {
                keluarga.TanggalBerlaku = $scope.tanggalBerlaku;
                Keluarga.create(keluarga, function(res){
                    $state.go('penduduk');
                })
            }
        }

        //datepicker
        $scope.today = function () {
            $scope.tanggalBerlaku = new Date();
        };

        $scope.clear = function () {
            $scope.tanggalBerlaku = null;
        };

        $scope.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };

        $scope.dateOptions = {
            dateDisabled: disabled,
            formatYear: 'yy',
            // maxDate: new Date(2020, 5, 22),
            // minDate: new Date(),
            startingDay: 1
        };

        // Disable weekend selection
        function disabled(data) {
            var date = data.date,
                mode = data.mode;
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        }

        $scope.toggleMin = function () {
            $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
        };

        $scope.toggleMin();

        $scope.open1 = function () {
            $scope.popup1.opened = true;
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
        $scope.altInputFormats = ['M!/d!/yyyy'];

        $scope.popup1 = {
            opened: false
        };

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }

            return '';
        }
    }

})();
