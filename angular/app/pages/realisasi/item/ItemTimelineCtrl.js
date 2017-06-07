/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.realisasi')
    .controller('ItemTimelineCtrl', ItemTimelineCtrl);

  /** @ngInject */
  function ItemTimelineCtrl($scope, $stateParams, RKP) {
    var timelineBlocks = $('.cd-timeline-block'),
      offset = 0.8;

    //hide timeline blocks which are outside the viewport
    hideBlocks(timelineBlocks, offset);

    //on scolling, show/animate timeline blocks when enter the viewport
    $(window).on('scroll', function () {
      if (!window.requestAnimationFrame) {
        setTimeout(function () {
          showBlocks(timelineBlocks, offset);
        }, 100);
      } else {
        window.requestAnimationFrame(function () {
          showBlocks(timelineBlocks, offset);
        });
      }
    });

    function hideBlocks(blocks, offset) {
      blocks.each(function () {
        ($(this).offset().top > $(window).scrollTop() + $(window).height() * offset) && $(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
      });
    }

    function showBlocks(blocks, offset) {
      blocks.each(function () {
        ($(this).offset().top <= $(window).scrollTop() + $(window).height() * offset && $(this).find('.cd-timeline-img').hasClass('is-hidden')) && $(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in');
      });
    }

    $scope.rkp = {};
    $scope.pembayaran = [];
    $scope.SaldoAkhir = 0;
    getRKP();

    function getRKP() {
      RKP.findById({
        id: $stateParams.id, filter: {
          include: {
            relation: "Realisasi", scope: {
              include: {
                relation: "Pembayaran", scope : {
                  order: "Tanggal ASC"
                }
              }
            }
          }
        }
      }, function (rkp) {
        $scope.rkp = rkp;
        var realisasi = rkp.Realisasi;
        if (realisasi) {
          var pembayaran = realisasi.Pembayaran;
          if (pembayaran.length > 0) {
            $scope.pembayaran = pembayaran;
            populatePembayaran($scope.pembayaran);
          }
        }
      })
    }

    var formatter = new Intl.NumberFormat();

    $scope.formatCurrency = function (value) {
      return formatter.format(value);
    }

    function populatePembayaran(pembayaran) {
      var length = pembayaran.length;
      pembayaran.forEach(function(item, i){
        item.SaldoAwal = 0;
        if (i != 0) {
          item.SaldoAwal = pembayaran[i-1].SaldoAkhir;
        }

        if(item.Debit) {
          $scope.SaldoAkhir -= item.Nominal;
          item.SaldoAkhir = item.SaldoAwal - item.Nominal;
        } else {
          $scope.SaldoAkhir += item.Nominal;
          item.SaldoAkhir = item.SaldoAwal + item.Nominal;
        }
      })
    }

  }
})();