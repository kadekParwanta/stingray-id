/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.penganggaran')
    .controller('APBDesPageCtrl', APBDesPageCtrl);

  /** @ngInject */
  function APBDesPageCtrl($scope, RPJM, Pendapatan, $q, Bidang, Biaya) {
    var vm = this;

    $scope.waktuPelaksanaanList = [];
    $scope.pendapatanList = [];
    $scope.activeRPJM;
    $scope.selectedWaktuPelaksanaan;
    $scope.pendapatanTableList = [];
    $scope.belanjaTableList = [];
    $scope.pembiayaanTableList = [];
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
                order: "No ASC",
                include: {
                  relation: 'AnggaranPendapatan', scope: {
                    order: "No ASC",
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
            var pendapatanData = {
              KodeRekening: [1, pendapatan.No],
              Uraian: pendapatan.Nama,
              Satuan: '',
              Harga: '',
              Jumlah: '',
              Keterangan: '',
              style: {
                'background-color': 'grey',
                'color': 'antiquewhite',
                'font-weight': 'bold'
              },
              id: pendapatan.id
            }
            var totalPendapatanJumlah = 0
            $scope.pendapatanTableList[indexWaktuPel].push(pendapatanData);

            var subpendapatanList = pendapatan.SubPendapatan;
            subpendapatanList.forEach(function (subpendapatan, index) {
              var subPendapatanData = {
                KodeRekening: [1, pendapatan.No, subpendapatan.No],
                Uraian: subpendapatan.Nama,
                Satuan: '',
                Harga: '',
                Jumlah: '',
                Keterangan: '',
                style: {
                  'font-weight': 'bold'
                },
                id: subpendapatan.id
              }
              var totalSubpendapatan = 0;
              $scope.pendapatanTableList[indexWaktuPel].push(subPendapatanData);

              var anggaranPendapatanList = subpendapatan.AnggaranPendapatan;
              anggaranPendapatanList.forEach(function (anggaranPendapatan) {
                $scope.pendapatanTableList[indexWaktuPel].push({
                  KodeRekening: "",
                  Uraian: "- " + anggaranPendapatan.Nama,
                  Satuan: '',
                  Harga: '',
                  Jumlah: $scope.formatCurrency(anggaranPendapatan.Jumlah),
                  Keterangan: '',
                  style: '',
                  id: subpendapatan.id
                })
                totalSubpendapatan += anggaranPendapatan.Jumlah;
                totalPendapatan += anggaranPendapatan.Jumlah;
              })
              totalPendapatanJumlah += totalSubpendapatan;
              var indexSubPendapatan = $scope.pendapatanTableList[indexWaktuPel].indexOf(subPendapatanData);
              $scope.pendapatanTableList[indexWaktuPel][indexSubPendapatan].Jumlah = $scope.formatCurrency(totalSubpendapatan);
            })

            var indexPendapatan = $scope.pendapatanTableList[indexWaktuPel].indexOf(pendapatanData);
            $scope.pendapatanTableList[indexWaktuPel][indexPendapatan].Jumlah = $scope.formatCurrency(totalPendapatanJumlah);
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
                  order: "No ASC",
                  include: {
                    relation: "RKP", scope: {
                      order: "No ASC",
                      include: {
                        relation: "Belanja", scope: {
                          order: "No ASC",
                          include: [
                            {
                              relation: "RAB", scope: {
                                order: "No ASC",
                              }
                            },
                            {
                              relation: "BelanjaTitle", scope: {
                                order: "No ASC",
                                include:
                                {
                                  relation: "RAB", scope: {
                                    order: "No ASC",
                                  }
                                }
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
                  order: "No ASC",
                  include: {
                    relation: "Belanja", scope: {
                      order: "No ASC",
                      include: [
                        {
                          relation: "RAB", scope: {
                            order: "No ASC",
                          }
                        },
                        {
                          relation: "BelanjaTitle", scope: {
                            order: "No ASC",
                            include:
                            {
                              relation: "RAB", scope: {
                                order: "No ASC",
                              }
                            }
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
            },
            order: "No ASC",
          }
        }, function (result) {
          var indexWaktuPel = waktupelaksanaan.No - 1;
          var totalBelanja = 0;
          $scope.belanjaTableList[indexWaktuPel] = [];
          angular.forEach(result, function (bidang, index, arr) {
            var bidangData = {
              KodeRekening: [2, bidang.No],
              Uraian: [bidang.Nama],
              Satuan: '',
              Harga: '',
              Jumlah: '',
              Keterangan: '',
              style: {
                'background-color': 'grey',
                'color': 'antiquewhite',
                'font-weight': 'bold'
              },
              id: bidang.id
            }
            $scope.belanjaTableList[indexWaktuPel].push(bidangData);
            var totalBidang = 0;

            var rpjmdesList = bidang.RPJMDes;
            rpjmdesList.forEach(function (rpjmdes) {
              var rpjmdesData = {
                KodeRekening: [2, bidang.No, rpjmdes.No],
                Uraian: [rpjmdes.Nama],
                Satuan: '',
                Harga: '',
                Jumlah: '',
                Keterangan: '',
                style: {
                  'background-color': 'lightgrey',
                  'color': 'black',
                  'font-weight': 'bold'
                },
                id: rpjmdes.id
              }
              $scope.belanjaTableList[indexWaktuPel].push(rpjmdesData);
              var totalRpjmdes = 0;

              var rkp = rpjmdes.RKP;
              rkp.forEach(function (rkpitem) {
                var rkpData = {
                  KodeRekening: [2, bidang.No, rpjmdes.No, rkpitem.No],
                  Uraian: [rkpitem.Nama],
                  Satuan: '',
                  Harga: '',
                  Jumlah: '',
                  Keterangan: '',
                  style: {
                    'background-color': 'lightgrey',
                    'color': 'black',
                    'font-weight': 'bold'
                  },
                  id: rkpitem.id
                }
                $scope.belanjaTableList[indexWaktuPel].push(rkpData);
                var totalRkp = 0;

                var belanjaList = rkpitem.Belanja;
                belanjaList.forEach(function (belanja) {
                  var belanjaData = {
                    KodeRekening: [2, bidang.No, rpjmdes.No, rkpitem.No, belanja.No],
                    Uraian: ["- " + belanja.Nama],
                    Satuan: '',
                    Harga: '',
                    Jumlah: '',
                    Keterangan: '',
                    style: '',
                    id: belanja.id
                  }
                  $scope.belanjaTableList[indexWaktuPel].push(belanjaData);
                  var totalBelanjaJumlah = 0;

                  var rabList = belanja.RAB;
                  rabList.forEach(function (rabItem) {
                    var jumlah = rabItem.Durasi * rabItem.Volume * rabItem.HargaSatuan;
                    var satuan = [];
                    if (rabItem.SatuanDurasi) {
                      satuan = [rabItem.Durasi, rabItem.SatuanDurasi, 'x', rabItem.Volume, rabItem.Satuan]
                    } else {
                      satuan = ['', '', '', rabItem.Volume, rabItem.Satuan]
                    }

                    var rabData = {
                      KodeRekening: '',
                      Uraian: [' ', "- " + rabItem.Nama],
                      Satuan: satuan,
                      Harga: $scope.formatCurrency(rabItem.HargaSatuan),
                      Jumlah: $scope.formatCurrency(jumlah),
                      Keterangan: '',
                      style: '',
                      id: rabItem.id
                    }
                    $scope.belanjaTableList[indexWaktuPel].push(rabData);

                    totalBelanja += jumlah;
                    totalBelanjaJumlah += jumlah;
                  })

                  var belanjaTitleList = belanja.BelanjaTitle;
                  belanjaTitleList.forEach(function (belanjaTitle) {
                    var belanjaTitleData = {
                      KodeRekening: '',
                      Uraian: ["- " + belanjaTitle.Nama],
                      Satuan: '',
                      Harga: '',
                      Jumlah: '',
                      Keterangan: '',
                      style: '',
                      id: belanjaTitle.id
                    }
                    var totalBelanjaTitle = 0;
                    $scope.belanjaTableList[indexWaktuPel].push(belanjaTitleData);

                    var rabList = belanjaTitle.RAB;
                    rabList.forEach(function (rabItem) {
                      var jumlah = rabItem.Durasi * rabItem.Volume * rabItem.HargaSatuan;
                      var satuan = [];
                      if (rabItem.SatuanDurasi) {
                        satuan = [rabItem.Durasi, rabItem.SatuanDurasi, 'x', rabItem.Volume, rabItem.Satuan]
                      } else {
                        satuan = ['', '', '', rabItem.Volume, rabItem.Satuan]
                      }
                      $scope.belanjaTableList[indexWaktuPel].push({
                        KodeRekening: '',
                        Uraian: [' ', "- " + rabItem.Nama],
                        Satuan: satuan,
                        Harga: $scope.formatCurrency(rabItem.HargaSatuan),
                        Jumlah: $scope.formatCurrency(jumlah),
                        Keterangan: '',
                        style: '',
                        id: rabItem.id
                      })

                      totalBelanja += jumlah;
                      totalBelanjaTitle += jumlah;
                    })

                    var indexBelanjaTitle = $scope.belanjaTableList[indexWaktuPel].indexOf(belanjaTitleData);
                    $scope.belanjaTableList[indexWaktuPel][indexBelanjaTitle].Jumlah = $scope.formatCurrency(totalBelanjaTitle);
                    totalBelanjaJumlah += totalBelanjaTitle;
                  })

                  var indexBelanjaJumlah = $scope.belanjaTableList[indexWaktuPel].indexOf(belanjaData);
                  $scope.belanjaTableList[indexWaktuPel][indexBelanjaJumlah].Jumlah = $scope.formatCurrency(totalBelanjaJumlah);
                  totalRkp += totalBelanjaJumlah;
                })

                var indexRkp = $scope.belanjaTableList[indexWaktuPel].indexOf(rkpData);
                $scope.belanjaTableList[indexWaktuPel][indexRkp].Jumlah = $scope.formatCurrency(totalRkp);
                totalRpjmdes += totalRkp;
              })

              var indexRpjmdes = $scope.belanjaTableList[indexWaktuPel].indexOf(rpjmdesData);
              $scope.belanjaTableList[indexWaktuPel][indexRpjmdes].Jumlah = $scope.formatCurrency(totalRpjmdes);
              totalBidang += totalRpjmdes;
            })


            var rkp = bidang.RKP;
            rkp.forEach(function (rkpitem) {
              var rkpData = {
                KodeRekening: [2, bidang.No, rkpitem.No],
                Uraian: [rkpitem.Nama],
                Satuan: '',
                Harga: '',
                Jumlah: '',
                Keterangan: '',
                style: {
                  'background-color': 'lightgrey',
                  'color': 'black',
                  'font-weight': 'bold'
                },
                id: rkpitem.id
              }
              $scope.belanjaTableList[indexWaktuPel].push(rkpData);
              var totalRkp = 0;

              var belanjaList = rkpitem.Belanja;
              belanjaList.forEach(function (belanja) {
                var belanjaData = {
                  KodeRekening: [2, bidang.No, rkpitem.No, belanja.No],
                  Uraian: [belanja.Nama],
                  Satuan: '',
                  Harga: '',
                  Jumlah: '',
                  Keterangan: '',
                  style: '',
                  id: belanja.id
                }
                $scope.belanjaTableList[indexWaktuPel].push(belanjaData);
                var totalBelanjaJumlah = 0;

                var rabList = belanja.RAB;
                rabList.forEach(function (rabItem) {
                  var jumlah = rabItem.Durasi * rabItem.Volume * rabItem.HargaSatuan;
                  var satuan = [];
                  if (rabItem.SatuanDurasi) {
                    satuan = [rabItem.Durasi, rabItem.SatuanDurasi, 'x', rabItem.Volume, rabItem.Satuan]
                  } else {
                    satuan = ['', '', '', rabItem.Volume, rabItem.Satuan]
                  }
                  $scope.belanjaTableList[indexWaktuPel].push({
                    KodeRekening: '',
                    Uraian: [' ', "- " + rabItem.Nama],
                    Satuan: satuan,
                    Harga: $scope.formatCurrency(rabItem.HargaSatuan),
                    Jumlah: $scope.formatCurrency(jumlah),
                    Keterangan: '',
                    style: '',
                    id: rabItem.id
                  })

                  totalBelanja += jumlah;
                  totalBelanjaJumlah += jumlah;
                })

                var belanjaTitleList = belanja.BelanjaTitle;
                belanjaTitleList.forEach(function (belanjaTitle) {
                  var belanjaTitleData = {
                    KodeRekening: '',
                    Uraian: ["- " + belanjaTitle.Nama],
                    Satuan: '',
                    Harga: '',
                    Jumlah: '',
                    Keterangan: '',
                    style: '',
                    id: belanjaTitle.id
                  }
                  $scope.belanjaTableList[indexWaktuPel].push(belanjaTitleData);
                  var totalBelanjaTitle = 0;

                  var rabList = belanjaTitle.RAB;
                  rabList.forEach(function (rabItem) {
                    var jumlah = rabItem.Durasi * rabItem.Volume * rabItem.HargaSatuan;
                    var satuan = [];
                    if (rabItem.SatuanDurasi) {
                      satuan = [rabItem.Durasi, rabItem.SatuanDurasi, 'x', rabItem.Volume, rabItem.Satuan]
                    } else {
                      satuan = ['', '', '', rabItem.Volume, rabItem.Satuan]
                    }
                    $scope.belanjaTableList[indexWaktuPel].push({
                      KodeRekening: '',
                      Uraian: [' ', "- " + rabItem.Nama],
                      Satuan: satuan,
                      Harga: $scope.formatCurrency(rabItem.HargaSatuan),
                      Jumlah: $scope.formatCurrency(jumlah),
                      Keterangan: '',
                      style: '',
                      id: rabItem.id
                    })

                    totalBelanja += jumlah;
                    totalBelanjaTitle += jumlah;
                  })

                  var indexBelanjaTitle = $scope.belanjaTableList[indexWaktuPel].indexOf(belanjaTitleData);
                  $scope.belanjaTableList[indexWaktuPel][indexBelanjaTitle].Jumlah = $scope.formatCurrency(totalBelanjaTitle);
                  totalBelanjaJumlah += totalBelanjaTitle;
                })

                var indexBelanjaJumlah = $scope.belanjaTableList[indexWaktuPel].indexOf(belanjaData);
                $scope.belanjaTableList[indexWaktuPel][indexBelanjaJumlah].Jumlah = $scope.formatCurrency(totalBelanjaJumlah);
                totalRkp += totalBelanjaJumlah;
              })
              var indexRkp = $scope.belanjaTableList[indexWaktuPel].indexOf(rkpData);
              $scope.belanjaTableList[indexWaktuPel][indexRkp].Jumlah = $scope.formatCurrency(totalRkp);
              totalBidang += totalRkp;
            })
            var indexBidang = $scope.belanjaTableList[indexWaktuPel].indexOf(bidangData);
            $scope.belanjaTableList[indexWaktuPel][indexBidang].Jumlah = $scope.formatCurrency(totalBidang);
          })
          deferred.resolve(totalBelanja);
        })

        return deferred.promise;
      })

      $q.all(promises).then(function (belanjaList) {
        $scope.totalBelanja = belanjaList;
        getPembiayaanByWaktu(waktuPelaksanaanList);
      })
    }

    function getPembiayaanByWaktu(waktuPelaksanaanList) {
      var promises = waktuPelaksanaanList.map(function (waktupelaksanaan) {
        var deferred = $q.defer();

        Biaya.find({
          filter: {
            include: {
              relation: 'SubBiaya', scope: {
                order: "No ASC",
                include: {
                  relation: 'AnggaranBiaya', scope: {
                    order: "No ASC",
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
        }, function (pembiayaanList) {
          var indexWaktuPel = waktupelaksanaan.No - 1;
          var totalpembiayaan = 0;
          $scope.pembiayaanTableList[indexWaktuPel] = [];

          angular.forEach(pembiayaanList, function (pembiayaan) {
            var pembiayaanData = {
              KodeRekening: [3, pembiayaan.No],
              Uraian: pembiayaan.Nama,
              Satuan: '',
              Harga: '',
              Jumlah: '',
              Keterangan: '',
              style: {
                'background-color': 'grey',
                'color': 'antiquewhite',
                'font-weight': 'bold'
              },
              id: pembiayaan.id
            }
            var totalPembiayaanJumlah = 0
            $scope.pembiayaanTableList[indexWaktuPel].push(pembiayaanData);

            var subPembiayaanList = pembiayaan.SubBiaya;
            subPembiayaanList.forEach(function (subBiaya, index) {
              var anggaranPembiayaan = subBiaya.AnggaranBiaya;
              var jumlahSubBiaya = 0;
              if (anggaranPembiayaan) {
                jumlahSubBiaya = anggaranPembiayaan.Jumlah;
              }
              var subBiayaData = {
                KodeRekening: [3, pembiayaan.No, subBiaya.No],
                Uraian: subBiaya.Nama,
                Satuan: '',
                Harga: '',
                Jumlah: jumlahSubBiaya,
                Keterangan: '',
                style: {
                  'font-weight': 'bold'
                },
                id: subBiaya.id
              }
              $scope.pembiayaanTableList[indexWaktuPel].push(subBiayaData);
              totalPembiayaanJumlah += jumlahSubBiaya;
            })

            var indexPembiayaan = $scope.pembiayaanTableList[indexWaktuPel].indexOf(pembiayaanData);
            $scope.pembiayaanTableList[indexWaktuPel][indexPembiayaan].Jumlah = $scope.formatCurrency(totalPembiayaanJumlah);
            if (pembiayaan.No == 1) {
              totalpembiayaan -= totalPembiayaanJumlah;
            } else {
              totalpembiayaan += totalPembiayaanJumlah;
            }
            
          })
          deferred.resolve(totalpembiayaan);
        })

        return deferred.promise;
      })

      $q.all(promises).then(function (pembiayaanList) {
        $scope.totalPembiayaan = pembiayaanList;
      })
    }


    var formatter = new Intl.NumberFormat();

    $scope.formatCurrency = function (value) {
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
