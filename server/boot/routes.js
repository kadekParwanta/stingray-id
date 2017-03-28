// Copyright IBM Corp. 2014. All Rights Reserved.
// Node module: loopback-getting-started
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = function (app) {

    app.get('/config', function (req, res) {
        var env = process.env.NODE_ENV;
        var dropboxToken = process.env.DROPBOX_TOKEN;
        
        res.send({
            env: env,
            dropbox: dropboxToken
        })
    });
};