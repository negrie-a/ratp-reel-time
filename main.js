// ./main.js
const {app, BrowserWindow} = require('electron')
const path = require('path');
const url = require('url');
const express = require('express');
const appServer = express();
const soap = require('soap');
// require('electron-reload')(__dirname, {
//   electron: require('${__dirname}/../../node_modules/electron')
// })

let win = null;
//
// require('dotenv').config();
//
// app.on('ready', function () {
//
//     // Initialize the window to our specified dimensions
//     win = new BrowserWindow({width: 1000, height: 600});
//
//     // Specify entry point
//     // Specify entry point
//     if (process.env.PACKAGE === 'true'){
//         win.loadURL(url.format({
//             pathname: path.join(__dirname, 'dist/index.html'),
//             protocol: 'file:',
//             slashes: true
//         }));
//     } else {
//         win.loadURL(process.env.HOST);
//         win.webContents.openDevTools();
//     }
//
//     // Show dev tools
//     // Remove this line before distributing
//     win.webContents.openDevTools()
//
//     // Remove window once app is closed
//     win.on('closed', function () {
//         win = null;
//     });
//
// });
//
// app.on('activate', () => {
//     if (win === null) {
//         createWindow()
//     }
// })
//
// app.on('window-all-closed', function () {
//     if (process.platform != 'darwin') {
//         app.quit();
//     }
// });
appServer.use('/', express.static(path.join(__dirname, 'public')));

appServer.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// ####################
// GET_MISSIONS
// ####################

appServer.get('/stations/:name/type/:id', function (req, res) {

    var url = 'http://localhost:3000/wsiv.wsdl';
    var args = {
        "ns1:station": {
            "line": {
                "id": req.params.id
            },
            "name": req.params.name
        },
        "ns1:direction": {
            "sens": req.query.sens || "*"
        }
    };

    soap.createClient(url, function(err, client) {
        if (err) {
            console.log(err)
        }
        client.getMissionsNext(args, function(err, result) {
            if (err) {
                console.log(err)
            }
            var m = {
                missions: result.return.missions
            }
            res.status(200).json(m);
        });
    });
});


appServer.get('/mission/:id/type/:type/notserved', function (req, res) {

    var url = 'http://localhost:3000/wsiv.wsdl';
    var args = {
        "ns1:mission": {
            "ns0:id": req.params.id,
            "ns0:line": {
                "ns0:id": req.params.type
            }
        },
        "ns1:stationAll": 1
    };

    soap.createClient(url, function(err, client) {
        if (err) {
            console.log(err)
        }
        client.getMission(args, function(err, result) {
            if (err) {
                console.log(err)
            }
            var m = {
                stations: result.return.mission.stations,
                stationsStops: result.return.mission.stationsStops
            }
            res.status(200).json(m);
        });
    });
});

appServer.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
