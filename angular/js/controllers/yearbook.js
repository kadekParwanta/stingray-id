// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-example-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .controller('YearbookController', ['$scope', '$state', 'Yearbook', 'School','$stateParams', 'FileUploader','Container', 
  '$rootScope', function($scope,
      $state, Yearbook, School,$stateParams,FileUploader, Container, $rootScope) {
    $scope.yearbooks = [];
    $scope.newYearbook = '';
    $scope.yearbookprices = [0,1000,2000,3000,4000,5000];

    $scope.currentYearbook = '';
    $scope.currentYearbookId = $stateParams.yearbookId;
    
    function getYearbookById(id) {
      Yearbook
        .findById({id:id})
        .$promise
        .then(function(yearbook) {
          $scope.currentYearbook = yearbook;
          if (yearbook.year) {
              $scope.setDate(yearbook.year, 1,1);
          } else {
            $scope.today();
          } 
          $scope.school = yearbook.school;
          $scope.yearbookprice = yearbook.price;
        });
    }

    function getContainerByName(name) {
      Container
        .getContainer({container:name})
        .$promise
        .then(function(container) {
          $scope.container = container;
          $scope.load();
        });
    }
    
    if ($scope.currentYearbookId) {
        getYearbookById($scope.currentYearbookId);
        getContainerByName($scope.currentYearbookId);
        setupUploader($scope.currentYearbookId);
    }

    $scope.createContainer = function(id) {
        Container
            .createContainer({ "name": id })
            .$promise
            .then(function (container) {
                $scope.container = container;
                $state.go('create-yearbook', ({ yearbookId: id }));
            });
    }

    $scope.saveYearbook = function () {
        if ($scope.uploader.queue.length > 0) {
            $scope.uploader.uploadAll()
        } else {
            $scope.currentYearbook.year = $scope.year.getFullYear();
            $scope.currentYearbook.school = $scope.school;
            $scope.currentYearbook.price = $scope.yearbookprice;
            $scope.currentYearbook.$save()
                .then(function (student) {
                    $state.go('yearbook');
                });
        }
    };

    function getYearbooks() {
      Yearbook
        .find()
        .$promise
        .then(function(results) {
          $scope.yearbooks = results;
        });
    }

    $scope.removeContainer = function(id){
        Container
        .destroyContainer({'container':id})
        .$promise
        .then(function(data){
          getYearbooks();
        });
    }

    getYearbooks();

    $scope.addYearbook = function() {
      Yearbook
        .create($scope.newYearbook)
        .$promise
        .then(function(yearbook) {
          $scope.newYearbook = '';
          $('.focus').focus();
          $scope.currentYearbook = yearbook;
          $scope.createContainer(yearbook.id);
        });
    };

    $scope.editYearbook = function() {
      $scope.newYearbook.year = $scope.year.getFullYear();
      Yearbook
        .create($scope.newYearbook)
        .$promise
        .then(function(yearbook) {
          $scope.newYearbook = '';
          $scope.yearbookForm.fullname.$setPristine();
          $scope.yearbookForm.school.$setPristine();
          $('.focus').focus();
          getYearbooks();
        });
    };

    $scope.removeYearbook = function(item) {
      Yearbook
        .deleteById(item)
        .$promise
        .then(function() {
            $scope.removeContainer(item.id);
        });
    };
    
    $scope.schools = [];
    function getSchools() {
      School
        .find()
        .$promise
        .then(function(results) {
          $scope.schools = results;
        });
    };
    
    getSchools();

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

    function setupUploader(containerName) {
        var uploader = $scope.uploader = new FileUploader({
            scope: $rootScope,
            url: '/api/containers/' + containerName + '/upload',
            formData: [{ key: 'value' }]
        });

        registerHandler(uploader);
    }


    function pushFilter(uploader) {
        // ADDING FILTERS
        uploader.filters.push({
            name: 'customFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 3;
            }
        });
    }


    // REGISTER HANDLERS
    function registerHandler(uploader) {
        // --------------------
        uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };

        uploader.onAfterAddingFile = function (item) {
            console.info('After adding a file', item);
            $scope.items = item;
        };
        // --------------------
        uploader.onAfterAddingAll = function (items) {
            console.info('After adding all files', items);
            $scope.items = items;
        };
        // --------------------
        uploader.onWhenAddingFileFailed = function (item, filter, options) {
            console.info('When adding a file failed', item);
        };
        // --------------------
        uploader.onBeforeUploadItem = function (item) {
            console.info('Before upload', item);
        };
        // --------------------
        uploader.onProgressItem = function (item, progress) {
            console.info('Progress: ' + progress, item);
        };
        // --------------------
        uploader.onProgressAll = function (progress) {
            console.info('Total progress: ' + progress);
        };
        // --------------------
        uploader.onSuccessItem = function (item, response, status, headers) {
            console.info('Success', response, status, headers);
            $scope.$broadcast('uploadCompleted', item);
        };
        // --------------------
        uploader.onErrorItem = function (item, response, status, headers) {
            console.info('Error', response, status, headers);
        };
        // --------------------
        uploader.onCancelItem = function (item, response, status, headers) {
            console.info('Cancel', response, status);
        };
        // --------------------
        uploader.onCompleteItem = function (item, response, status, headers) {
            console.info('Complete',item, response, status, headers);
        };
        // --------------------
        uploader.onCompleteAll = function () {
            console.info('Complete all');
            $scope.currentYearbook.year = $scope.year.getFullYear();
            $scope.currentYearbook.school = $scope.school;
            $scope.currentYearbook.price = $scope.yearbookprice;
            $scope.currentYearbook.cover_url= '/api/containers/'+$scope.container.name+'/download/'+$scope.items[0].file.name
            $scope.currentYearbook.epub_url= '/api/containers/'+$scope.container.name+'/download/'+$scope.items[1].file.name
            $scope.currentYearbook.$save()
                .then(function (student) {
                    $state.go('yearbook');
                });
        };

        console.info('uploader', uploader);
    }

    $scope.load = function () {
        Container
        .getFiles({container:$scope.container.name})
        .$promise
        .then(function(data) {
          $scope.files = data;
        });
    }

    $scope.delete = function (index, id) {
        var fileId = encodeURIComponent(id);
        Container
        .removeFile({container:$scope.container.name, file:fileId})
        .$promise
        .then(function(data) {
          $scope.files.splice(index, 1);
        });
    }

  }]);