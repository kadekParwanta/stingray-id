/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.penduduk')
        .controller('KeluargaDetailPageCtrl', KeluargaDetailPageCtrl);

    /** @ngInject */
    function KeluargaDetailPageCtrl($scope, keluargaId, Keluarga, $state, editableOptions, editableThemes, $filter, Penduduk, $q) {
        var vm = this;
        $scope.keluarga;
        $scope.tanggalBerlaku;
        $scope.anggotaKeluarga = [];
        if (keluargaId != 0) {
            getKeluargaById(keluargaId);
        }

        function getKeluargaById(id) {
            Keluarga.findById({ id: id, filter: { include: ['AnggotaKeluarga', 'KepalaKeluarga'] } }
                , function (keluarga) {
                    $scope.keluarga = keluarga;
                    $scope.tanggalBerlaku = new Date(keluarga.TanggalBerlaku);
                    var kepalaKeluarga = keluarga.KepalaKeluarga;
                    if (kepalaKeluarga) {
                        $scope.anggotaKeluarga.push(kepalaKeluarga);
                    }

                    var anggotaKeluarga = keluarga.AnggotaKeluarga;
                    anggotaKeluarga.forEach(function (item) {
                        $scope.anggotaKeluarga.push(item);
                    })
                })
        }

        $scope.editKeluarga = function (keluarga) {
            if (keluarga.id) {
                Keluarga.prototype$updateAttributes({
                    id: keluarga.id,
                    NoKK: keluarga.NoKK,
                    Alamat: keluarga.Alamat,
                    TanggalBerlaku: $scope.tanggalBerlaku
                }, function (res) {
                    saveAnggotaKeluarga($scope.anggotaKeluarga, keluarga.id).then(function(res){
                        $state.go('penduduk');
                    })
                    
                })
            } else {
                keluarga.TanggalBerlaku = $scope.tanggalBerlaku;
                Keluarga.create(keluarga, function (res) {
                    saveAnggotaKeluarga($scope.anggotaKeluarga, res.id).then(function(res){
                        $state.go('penduduk');
                    })
                })
            }
        }

        $scope.jenisKelamin = [{ text: 'Perempuan' }, { text: 'Laki-laki' }];
        $scope.golonganDarah = [{ text: 'O' }, { text: 'A' },{ text: 'AB' }, { text: 'B' }];
        $scope.Agama = [{ text: 'Islam' }, { text: 'Katolik' },{ text: 'Protestan' }, { text: 'Hindu' }, { text: 'Budha' }];

        $scope.showJenisKelamin = function (anggotaKeluarga) {
            var selected = [];
            if (anggotaKeluarga.JenisKelamin) {
                selected = $filter('filter')($scope.jenisKelamin, { text: anggotaKeluarga.JenisKelamin });
            }
            return selected.length ? selected[0].text : 'Not set';
        };

        $scope.showGolonganDarah = function (anggotaKeluarga) {
            var selected = [];
            if (anggotaKeluarga.GolDarah) {
                selected = $filter('filter')($scope.golonganDarah, { text: anggotaKeluarga.GolDarah });
            }
            return selected.length ? selected[0].text : 'Not set';
        };

         $scope.showAgama = function (anggotaKeluarga) {
            var selected = [];
            if (anggotaKeluarga.Agama) {
                selected = $filter('filter')($scope.Agama, { text: anggotaKeluarga.Agama });
            }
            return selected.length ? selected[0].text : 'Not set';
        };

        


        $scope.removeAnggotaKeluarga = function (index) {
            $scope.anggotaKeluarga.splice(index, 1);
        };

        $scope.addAnggotaKeluarga = function () {
            $scope.inserted = {
                Nama: '',
                TempatLahir: null,
                JenisKelamin: null
            };
            $scope.anggotaKeluarga.push($scope.inserted);
        };

        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

        function saveAnggotaKeluarga(listAnggotaKeluarga, keluargaId) {
            var promises = listAnggotaKeluarga.map(function (anggotaKeluarga) {
                var deferred = $q.defer();
                if (anggotaKeluarga.id) {
                    Penduduk.prototype$updateAttributes({
                        Nama: anggotaKeluarga.Nama,
                        JenisKelamin: anggotaKeluarga.JenisKelamin,
                        TempatLahir: anggotaKeluarga.TempatLahir,
                        TanggalLahir: anggotaKeluarga.TanggalLahir,
                        NIK: anggotaKeluarga.NIK,
                        GolDarah: anggotaKeluarga.GolDarah,
                        Agama: anggotaKeluarga.Agama,
                        Kewarganegaraan: anggotaKeluarga.Kewarganegaraan,
                        id: anggotaKeluarga.id
                    }, function (res) {
                        deferred.resolve(res);
                    })
                } else {
                    anggotaKeluarga.AnggotaKeluargaId = keluargaId;
                    Penduduk.create(anggotaKeluarga, function (res) {
                        deferred.resolve(res);
                    })
                }
                return deferred.promise;
            })

            return $q.all(promises);

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
