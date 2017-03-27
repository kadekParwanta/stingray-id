/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.penganggaran')
    .controller('APBDesPageCtrl', APBDesPageCtrl);

  /** @ngInject */
  function APBDesPageCtrl($scope, RPJM, Pendapatan, $q) {
    var vm = this;

    $scope.waktuPelaksanaanList = [];
    $scope.pendapatanList = [];
    $scope.activeRPJM;
    $scope.selectedWaktuPelaksanaan;
    $scope.pendapatanTableList = [];

    function getActiveRPJM() {
      RPJM.findOne({
        filter: {
          where: { IsActive: true },
          include: [
            {
              relation: "WaktuPelaksanaan",
              scope: {
                order: "No ASC"
              }
            }
          ]
        }
      }, function (result) {
        $scope.activeRPJM = {
          id: result.id,
          TahunMulai: result.TahunMulai,
          TahunSelesai: result.TahunSelesai,
          Regulasi: result.Regulasi,
          Perihal: result.Perihal,
          Keterangan: result.Keterangan
        }

        $scope.waktuPelaksanaanList = result.WaktuPelaksanaan;
        getPendapatanByWaktu($scope.waktuPelaksanaanList);
      })
    }

    function getPendapatanByWaktu(waktuPelaksanaanList) {
      var promises = waktuPelaksanaanList.map(function (waktupelaksanaan) {
        var deferred = $q.defer();

        Pendapatan.find({
          filter: {
            include: {
              relation: 'SubPendapatan', scope: {
                include: {
                  relation: 'AnggaranPendapatan', scope: {
                    where: {
                      WaktuPelaksanaanId: waktupelaksanaan.id
                    }
                  }
                }
              }
            },
            where: {
              RPJMId: $scope.activeRPJM.id
            }
          }
        }, function (pendapatanList) {
          var indexWaktuPel = waktupelaksanaan.No - 1;
          $scope.pendapatanTableList[indexWaktuPel] = [];
          angular.forEach(pendapatanList, function (pendapatan) {
            //TODO
            $scope.pendapatanTableList[indexWaktuPel].push({
              KodeRekening: 1+"."+pendapatan.No,
              Uraian: pendapatan.Nama,
              Satuan: '',
              Harga: '',
              Jumlah: '',
              Keterangan: '',
              style:{
                  'background-color': 'grey', 
                  'color':'antiquewhite',
                  'font-weight':'bold'
                }
            })

            var subpendapatanList = pendapatan.SubPendapatan;
            subpendapatanList.forEach(function (subpendapatan, index) {
              var subPendapatanId = waktupelaksanaan.id + "-" + subpendapatan.id;
              //TODO
              $scope.pendapatanTableList[indexWaktuPel].push({
                KodeRekening: 1+"."+pendapatan.No + "." + subpendapatan.No,
                Uraian: subpendapatan.Nama,
                Satuan: '',
                Harga: '',
                Jumlah: '',
                Keterangan: '',
                style:{
                  'font-weight':'bold'
                }
              })

              var anggaranPendapatanList = subpendapatan.AnggaranPendapatan;
              anggaranPendapatanList.forEach(function (anggaranPendapatan) {
                //TODO
                $scope.pendapatanTableList[indexWaktuPel].push({
                  KodeRekening: "",
                  Uraian: "- "+anggaranPendapatan.Nama,
                  Satuan: '',
                  Harga: '',
                  Jumlah: anggaranPendapatan.Jumlah,
                  Keterangan: '',
                  style:''
                })
              })
            })
          })
          deferred.resolve(pendapatanList);
        })

        return deferred.promise;
      })

      $q.all(promises).then(function (pendapatanList) {

      })
    }

    getActiveRPJM();

    function getActiveTab() {
      return $scope.selectedWaktuPelaksanaan;
    };


    $scope.tabSelected = function (tab) {
      $scope.selectedWaktuPelaksanaan = tab;
    }
  }

})();
