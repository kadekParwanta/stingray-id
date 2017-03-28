/**
 * @author n.poltoratsky
 * created on 27.06.2016
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.theme')
        .factory('siDropbox', siDropbox);

    /** @ngInject */
    function siDropbox($rootScope) {
        var access_token = $rootScope.dropboxToken;
        var dbx = new Dropbox({ accessToken: access_token });

        return {
            filesListFolder: function (path) {
                return dbx.filesListFolder({path: path});
            },
            filesUpload: function(file) {
                return dbx.filesUpload({path: '/' +file.name, contents: file});
            },
            filesGetThumbnail: function(filePath) {
                return dbx.filesGetThumbnail({path: filePath});
            },
            filesDownload: function(filePath) {
                return dbx.filesDownload({path: filePath});
            },
            filesDelete: function(filePath) {
                return dbx.filesDelete({path: filePath});
            }
        };
    }

})();