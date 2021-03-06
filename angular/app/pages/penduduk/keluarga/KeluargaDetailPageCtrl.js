/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.penduduk')
        .controller('KeluargaDetailPageCtrl', KeluargaDetailPageCtrl);

    /** @ngInject */
    function KeluargaDetailPageCtrl($scope, keluargaId, Keluarga, $state, editableOptions, editableThemes, $filter, Penduduk, $q, $http) {
        var vm = this;
        $scope.keluarga;
        $scope.tanggalBerlaku;
        $scope.anggotaKeluarga = [];
        $scope.kepalaKeluarga = [];
        $scope.countries = [];
        if (keluargaId != 0) {
            getKeluargaById(keluargaId);
        } else {
            getCountries();
        }

        function getKeluargaById(id) {
            Keluarga.findById({ id: id, filter: { include: ['AnggotaKeluarga', 'KepalaKeluarga'] } }
                , function (keluarga) {
                    $scope.keluarga = keluarga;
                    $scope.tanggalBerlaku = new Date(keluarga.TanggalBerlaku);
                    var kepalaKeluarga = keluarga.KepalaKeluarga;
                    if (kepalaKeluarga) {
                        $scope.kepalaKeluarga.push(kepalaKeluarga);
                    }

                    var anggotaKeluarga = keluarga.AnggotaKeluarga;
                    anggotaKeluarga.forEach(function (item) {
                        $scope.anggotaKeluarga.push(item);
                    })

                    getCountries();
                })
        }

        function getCountries() {
            $http.get('https://restcountries.eu/rest/v2/all?fields=name')
                .then(function (res) {
                    $scope.countries = res.data;
                })
                .catch(function (err) {
                    console.log(err);
                });
        }

        $scope.editKeluarga = function (keluarga) {
            if (keluarga.id) {
                Keluarga.prototype$patchAttributes({
                    id: keluarga.id,
                    NoKK: keluarga.NoKK,
                    Alamat: keluarga.Alamat,
                    TanggalBerlaku: $scope.tanggalBerlaku
                }, function (res) {
                    saveAnggotaKeluarga($scope.anggotaKeluarga, keluarga.id).then(function (res) {
                        saveKepalaKeluarga($scope.kepalaKeluarga, keluarga.id).then(function(res){
                            $state.go('penduduk');
                        })
                    })

                })
            } else {
                keluarga.TanggalBerlaku = $scope.tanggalBerlaku;
                Keluarga.create(keluarga, function (res) {
                    saveAnggotaKeluarga($scope.anggotaKeluarga, res.id).then(function (res) {
                        saveKepalaKeluarga($scope.kepalaKeluarga, keluarga.id).then(function(res){
                            $state.go('penduduk');
                        })
                    })
                })
            }
        }

        $scope.jenisKelamin = [{ text: 'Perempuan' }, { text: 'Laki-laki' }];
        $scope.golonganDarah = [{ text: 'O' }, { text: 'A' }, { text: 'AB' }, { text: 'B' }];
        $scope.Agama = [{ text: 'Islam' }, { text: 'Katolik' }, { text: 'Protestan' }, { text: 'Hindu' }, { text: 'Budha' }];

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

        $scope.showCountry = function (anggotaKeluarga) {
            var selected = [];
            if (anggotaKeluarga.Kewarganegaraan) {
                selected = $filter('filter')($scope.countries, { name: anggotaKeluarga.Kewarganegaraan });
            }
            return selected.length ? selected[0].name : 'Not set';
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
        
        $scope.removeKepalaKeluarga = function (index) {
            $scope.kepalaKeluarga.splice(index, 1);
        };

        $scope.addKepalaKeluarga = function () {
            $scope.inserted = {
                Nama: '',
                TempatLahir: null,
                JenisKelamin: null
            };
            $scope.kepalaKeluarga.push($scope.inserted);
        };

        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

        function saveAnggotaKeluarga(listAnggotaKeluarga, keluargaId) {
            var promises = listAnggotaKeluarga.map(function (anggotaKeluarga) {
                var deferred = $q.defer();
                if (anggotaKeluarga.id) {
                    Penduduk.prototype$patchAttributes({
                        Nama: anggotaKeluarga.Nama,
                        JenisKelamin: anggotaKeluarga.JenisKelamin,
                        TempatLahir: anggotaKeluarga.TempatLahir,
                        TanggalLahir: anggotaKeluarga.TanggalLahir,
                        NIK: anggotaKeluarga.NIK,
                        GolDarah: anggotaKeluarga.GolDarah,
                        Agama: anggotaKeluarga.Agama,
                        Kewarganegaraan: anggotaKeluarga.Kewarganegaraan,
                        Pendidikan: anggotaKeluarga.Pendidikan,
                        Pekerjaan: anggotaKeluarga.Pekerjaan,
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

        function saveKepalaKeluarga(listKepalaKeluarga, keluargaId) {
            var promises = listKepalaKeluarga.map(function (kepalaKeluarga) {
                var deferred = $q.defer();
                if (kepalaKeluarga.id) {
                    Penduduk.prototype$patchAttributes({
                        Nama: kepalaKeluarga.Nama,
                        JenisKelamin: kepalaKeluarga.JenisKelamin,
                        TempatLahir: kepalaKeluarga.TempatLahir,
                        TanggalLahir: kepalaKeluarga.TanggalLahir,
                        NIK: kepalaKeluarga.NIK,
                        GolDarah: kepalaKeluarga.GolDarah,
                        Agama: kepalaKeluarga.Agama,
                        Kewarganegaraan: kepalaKeluarga.Kewarganegaraan,
                        Pendidikan: kepalaKeluarga.Pendidikan,
                        Pekerjaan: kepalaKeluarga.Pekerjaan,
                        id: kepalaKeluarga.id
                    }, function (res) {
                        deferred.resolve(res);
                    })
                } else {
                    kepalaKeluarga.KepalaKeluargaId = keluargaId;
                    Penduduk.create(kepalaKeluarga, function (res) {
                        deferred.resolve(res);
                    })
                }
                return deferred.promise;
            })

            return $q.all(promises);

        }

        //datepicker
        $scope.opened = {};

        $scope.open = function ($event, elementOpened) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened[elementOpened] = !$scope.opened[elementOpened];
        };

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
