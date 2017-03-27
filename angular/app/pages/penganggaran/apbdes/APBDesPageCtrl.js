/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.penganggaran')
    .controller('APBDesPageCtrl', APBDesPageCtrl);

  /** @ngInject */
  function APBDesPageCtrl($scope, RPJM, Pendapatan, $q, Bidang) {
    var vm = this;

    $scope.waktuPelaksanaanList = [];
    $scope.pendapatanList = [];
    $scope.activeRPJM;
    $scope.selectedWaktuPelaksanaan;
    $scope.pendapatanTableList = [];
    $scope.belanjaTableList = [];
    $scope.totalPendapatan = [];
    $scope.totalBelanja = [];

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
          var totalPendapatan = 0;
          $scope.pendapatanTableList[indexWaktuPel] = [];
          angular.forEach(pendapatanList, function (pendapatan) {
            $scope.pendapatanTableList[indexWaktuPel].push({
              KodeRekening: 1 + "." + pendapatan.No,
              Uraian: pendapatan.Nama,
              Satuan: '',
              Harga: '',
              Jumlah: '',
              Keterangan: '',
              style: {
                'background-color': 'grey',
                'color': 'antiquewhite',
                'font-weight': 'bold'
              }
            })

            var subpendapatanList = pendapatan.SubPendapatan;
            subpendapatanList.forEach(function (subpendapatan, index) {
              $scope.pendapatanTableList[indexWaktuPel].push({
                KodeRekening: 1 + "." + pendapatan.No + "." + subpendapatan.No,
                Uraian: subpendapatan.Nama,
                Satuan: '',
                Harga: '',
                Jumlah: '',
                Keterangan: '',
                style: {
                  'font-weight': 'bold'
                }
              })

              var anggaranPendapatanList = subpendapatan.AnggaranPendapatan;
              anggaranPendapatanList.forEach(function (anggaranPendapatan) {
                $scope.pendapatanTableList[indexWaktuPel].push({
                  KodeRekening: "",
                  Uraian: "- " + anggaranPendapatan.Nama,
                  Satuan: '',
                  Harga: '',
                  Jumlah: $scope.formatCurrency(anggaranPendapatan.Jumlah),
                  Keterangan: '',
                  style: ''
                })
                totalPendapatan += anggaranPendapatan.Jumlah;
              })
            })
          })
          deferred.resolve(totalPendapatan);
        })

        return deferred.promise;
      })

      $q.all(promises).then(function (pendapatanList) {
        $scope.totalPendapatan = pendapatanList;
        getRKPByWaktu(waktuPelaksanaanList);
      })
    }

    function getRKPByWaktu(waktuPelaksanaanList) {
      var promises = waktuPelaksanaanList.map(function (waktupelaksanaan) {
        var deferred = $q.defer();

        Bidang.find({
          filter: {
            include: [
              {
                relation: "RPJMDes", scope: {
                  include: {
                    relation: "RKP", scope: {
                      include: {
                        relation: "Belanja", scope: {
                          include: [
                            { relation: "RAB" },
                            {
                              relation: "BelanjaTitle", scope: {
                                include:
                                { relation: "RAB" }
                              }
                            }]
                        }
                      }
                    },
                    where: {
                      WaktuPelaksanaanId: waktupelaksanaan.id
                    }
                  }
                }
              },
              {
                relation: "RKP", scope: {
                  include: {
                    relation: "Belanja", scope: {
                      include: [
                        { relation: "RAB" },
                        {
                          relation: "BelanjaTitle", scope: {
                            include:
                            { relation: "RAB" }
                          }
                        }]
                    }
                  },
                  where: {
                    WaktuPelaksanaanId: waktupelaksanaan.id
                  }
                }
              }
            ],
            where: {
              RPJMId: $scope.activeRPJM.id
            }
          }
        }, function (result) {
          var indexWaktuPel = waktupelaksanaan.No - 1;
          var totalBelanja = 0;
          $scope.belanjaTableList[indexWaktuPel] = [];
          angular.forEach(result, function (bidang, index, arr) {
            $scope.belanjaTableList[indexWaktuPel].push({
              KodeRekening: 2 + "." + bidang.No,
              Uraian: bidang.Nama,
              Satuan: '',
              Harga: '',
              Jumlah: '',
              Keterangan: '',
              style: {
                'background-color': 'grey',
                'color': 'antiquewhite',
                'font-weight': 'bold'
              }
            })

            var rpjmdesList = bidang.RPJMDes;
            rpjmdesList.forEach(function (rpjmdes) {
              $scope.belanjaTableList[indexWaktuPel].push({
                KodeRekening: 2 + "." + bidang.No + "." + rpjmdes.No,
                Uraian: rpjmdes.Nama,
                Satuan: '',
                Harga: '',
                Jumlah: '',
                Keterangan: '',
                style: {
                  'background-color': 'lightgrey',
                  'color': 'black',
                  'font-weight': 'bold'
                }
              })
              var rkp = rpjmdes.RKP;
              rkp.forEach(function (rkpitem) {
                $scope.belanjaTableList[indexWaktuPel].push({
                  KodeRekening: 2 + "." + bidang.No + "." + rpjmdes.No + "." + rkpitem.No,
                  Uraian: rkpitem.Nama,
                  Satuan: '',
                  Harga: '',
                  Jumlah: '',
                  Keterangan: '',
                  style: {
                    'background-color': 'lightgrey',
                    'color': 'black',
                    'font-weight': 'bold'
                  }
                })

                var belanjaList = rkpitem.Belanja;
                belanjaList.forEach(function (belanja) {
                  $scope.belanjaTableList[indexWaktuPel].push({
                    KodeRekening: 2 + "." + bidang.No + "." + rpjmdes.No + "." + rkpitem.No + "." + belanja.No,
                    Uraian: belanja.Nama,
                    Satuan: '',
                    Harga: '',
                    Jumlah: '',
                    Keterangan: '',
                    style: ''
                  })

                  var rabList = belanja.RAB;
                  rabList.forEach(function (rabItem) {
                    var jumlah = rabItem.Durasi * rabItem.Volume * rabItem.HargaSatuan;
                    $scope.belanjaTableList[indexWaktuPel].push({
                      KodeRekening: '',
                      Uraian: "-" + rabItem.Nama,
                      Satuan: rabItem.Durasi + " " + rabItem.SatuanDurasi + " x " + rabItem.Volume + " " + rabItem.Satuan,
                      Harga: $scope.formatCurrency(rabItem.HargaSatuan),
                      Jumlah: $scope.formatCurrency(jumlah),
                      Keterangan: '',
                      style: ''
                    })

                    totalBelanja += jumlah;
                  })

                  var belanjaTitleList = belanja.BelanjaTitle;
                  belanjaTitleList.forEach(function (belanjaTitle) {
                    $scope.belanjaTableList[indexWaktuPel].push({
                      KodeRekening: '',
                      Uraian: belanjaTitle.Nama,
                      Satuan: '',
                      Harga: '',
                      Jumlah: '',
                      Keterangan: '',
                      style: ''
                    })
                    var rabList = belanjaTitle.RAB;
                    rabList.forEach(function (rabItem) {
                      var jumlah = rabItem.Durasi * rabItem.Volume * rabItem.HargaSatuan;
                      $scope.belanjaTableList[indexWaktuPel].push({
                      KodeRekening: '',
                      Uraian: "-" + rabItem.Nama,
                      Satuan: rabItem.Durasi + " " + rabItem.SatuanDurasi + " x " + rabItem.Volume + " " + rabItem.Satuan,
                      Harga: $scope.formatCurrency(rabItem.HargaSatuan),
                      Jumlah: $scope.formatCurrency(jumlah),
                      Keterangan: '',
                      style: ''
                    })

                      totalBelanja += jumlah;
                    })
                  })
                })
              })
            })


            var rkp = bidang.RKP;
            rkp.forEach(function (rkpitem) {
              $scope.belanjaTableList[indexWaktuPel].push({
                KodeRekening: 2 + "." + bidang.No + "." + rkpitem.No,
                Uraian: rkpitem.Nama,
                Satuan: '',
                Harga: '',
                Jumlah: '',
                Keterangan: '',
                style: {
                  'background-color': 'lightgrey',
                  'color': 'black',
                  'font-weight': 'bold'
                }
              })

              var belanjaList = rkpitem.Belanja;
              belanjaList.forEach(function (belanja) {
                $scope.belanjaTableList[indexWaktuPel].push({
                  KodeRekening: 2 + "." + bidang.No + "." + rkpitem.No + "." + belanja.No,
                  Uraian: belanja.Nama,
                  Satuan: '',
                  Harga: '',
                  Jumlah: '',
                  Keterangan: '',
                  style: ''
                })

                var rabList = belanja.RAB;
                rabList.forEach(function (rabItem) {
                  var jumlah = rabItem.Durasi * rabItem.Volume * rabItem.HargaSatuan;
                  $scope.belanjaTableList[indexWaktuPel].push({
                      KodeRekening: '',
                      Uraian: "-" + rabItem.Nama,
                      Satuan: rabItem.Durasi + " " + rabItem.SatuanDurasi + " x " + rabItem.Volume + " " + rabItem.Satuan,
                      Harga: $scope.formatCurrency(rabItem.HargaSatuan),
                      Jumlah: $scope.formatCurrency(jumlah),
                      Keterangan: '',
                      style: ''
                    })

                  totalBelanja += jumlah;
                })

                var belanjaTitleList = belanja.BelanjaTitle;
                belanjaTitleList.forEach(function (belanjaTitle) {
                  $scope.belanjaTableList[indexWaktuPel].push({
                    KodeRekening: '',
                    Uraian: belanjaTitle.Nama,
                    Satuan: '',
                    Harga: '',
                    Jumlah: '',
                    Keterangan: '',
                    style: ''
                  })
                  var rabList = belanjaTitle.RAB;
                  rabList.forEach(function (rabItem) {
                    var jumlah = rabItem.Durasi * rabItem.Volume * rabItem.HargaSatuan;
                    $scope.belanjaTableList[indexWaktuPel].push({
                      KodeRekening: '',
                      Uraian: "-" + rabItem.Nama,
                      Satuan: rabItem.Durasi + " " + rabItem.SatuanDurasi + " x " + rabItem.Volume + " " + rabItem.Satuan,
                      Harga: $scope.formatCurrency(rabItem.HargaSatuan),
                      Jumlah: $scope.formatCurrency(jumlah),
                      Keterangan: '',
                      style: ''
                    })

                    totalBelanja += jumlah;
                  })
                })
              })
            })
          })
          deferred.resolve(totalBelanja);
        })

        return deferred.promise;
      })

      $q.all(promises).then(function (belanjaList) {
        $scope.totalBelanja = belanjaList;
      })
    }


    var formatter = new Intl.NumberFormat();

    $scope.formatCurrency = function(value) {
      return formatter.format(value);
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
