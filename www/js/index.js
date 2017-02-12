var app = {

    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    changeInterval: function (button) {
        navigator.accelerometer.clearWatch(app.sensorsWatchID);
        app.sensorsWatchID = navigator.accelerometer.watchAcceleration(app.onAccelSuccess, null, {frequency: parseInt(button.innerText)});

        for (var i = 0; i < app.intervalButtons.length; i++) {
            app.intervalButtons[i].classList.remove('current');
        }
        button.classList.add('current');
    },


    pad: function (n) {
        return n < 10 ? '0' + n : n;
    },

    onAccelSuccess: function (acceleration) {
        document.getElementById('sx').innerHTML = (Math.round(acceleration.x * 1000) / 1000) + '<br/>' + (Math.round(acceleration.y * 1000) / 1000) + '<br/>' + (Math.round(acceleration.z * 1000) / 1000);

        var gpsDataToWrite = '';

        if (typeof app.position != 'undefined') {

            var gpsInfo = 'Latitude: '+ app.position.coords.latitude          + '<br/>' +
                'Longitude: '         + app.position.coords.longitude         + '<br/>' +
                'Altitude: '          + app.position.coords.altitude          + '<br/>' +
                'Accuracy: '          + app.position.coords.accuracy          + '<br/>' +
                'Altitude Accuracy: ' + app.position.coords.altitudeAccuracy  + '<br/>' +
                'Heading: '           + app.position.coords.heading           + '<br/>' +
                'Speed: '             + app.position.coords.speed;

            if (Math.abs((Date.now() - app.position.timestamp)) > 3000) {
                gpsInfo += '<div class="red">GPS signal lost</div>';
            } else {
                gpsDataToWrite = ';' + app.position.coords.latitude + ';' + app.position.coords.longitude;
            }
            document.getElementById('gpsPosition').innerHTML = gpsInfo;

        } else {
            document.getElementById('gpsPosition').innerHTML = 'No GPS';
        }

        if (app.handle) {
            var d = new Date();
            var dateToWrite = d.getFullYear() + '-' + app.pad(d.getMonth() + 1) + '-' + app.pad(d.getDate()) + ' ' + app.pad(d.getHours()) + ':' + app.pad(d.getMinutes()) + ':' + app.pad(d.getSeconds()) + '.' + d.getMilliseconds();
            dateToWrite += ';' + acceleration.x + ';' + acceleration.y + ';' + acceleration.z + gpsDataToWrite;
            app.writeFile(app.handle, dateToWrite + "\n", true);
        }
    },

    writeFile: function (fileEntry, dataObj, isAppend) {
        fileEntry.createWriter(function (fileWriter) {

            if (isAppend) {
                try {
                    fileWriter.seek(fileWriter.length);
                    document.getElementById('fileSize').innerHTML = fileWriter.length;
                }
                catch (e) {
                }
            }

            fileWriter.write(dataObj);
        });
    },

    onDeviceReady: function () {

        app.intervalButtons = document.getElementsByClassName('interval');

        for (var i = 0; i < app.intervalButtons.length; i++) {
            app.intervalButtons[i].addEventListener('click', function() {app.changeInterval(this)}, false);
        }

        var switchRecordButton = document.getElementById("switchRecordButton");
        app.handle = null;
        switchRecordButton.addEventListener('click', switchRecord, false);

        var switchGPS = document.getElementById('gps');
        switchGPS.addEventListener('click', function() {app.switchGPS(this)}, false);

        function onErrorFs() {
        }

        function createFile(dirEntry, fileName) {
            // Creates a new file or returns the file if it already exists.
            dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
                app.handle = fileEntry;
            }, onErrorFs);

        }

        function switchRecord() {
            if (switchRecordButton.innerText == 'Stop record') {
                document.getElementById('fileSizeContainer').style.display = 'none';
                switchRecordButton.innerText = 'Start record';
                app.handle = false;
            } else {
                document.getElementById('fileSizeContainer').style.display = 'block';
                window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (dirEntry) {
                    dirEntry.getDirectory('Download', {}, function (downloadsDirEntry) {
                        var d = new Date();
                        var filename = 'sensors_' + d.getFullYear() + '-' + app.pad(d.getMonth() + 1) + '-' + app.pad(d.getDate()) + '_' + app.pad(d.getHours()) + '-' + app.pad(d.getMinutes()) + '-' + app.pad(d.getSeconds()) + '.txt';
                        document.getElementById('fileName').innerText = cordova.file.externalRootDirectory + 'Download/' + filename;

                        createFile(downloadsDirEntry, filename);

                    }, onErrorFs);
                }, onErrorFs);

                switchRecordButton.innerText = 'Stop record';
            }
        }

        app.sensorsWatchID = navigator.accelerometer.watchAcceleration(app.onAccelSuccess, null, {frequency: 100});

    },

    switchGPS: function (el) {
        if (el.checked) {
            app.gpsWatchID = navigator.geolocation.watchPosition(app.onGpsSuccess, app.onGpsError, { maximumAge: 3000, timeout: 10000, enableHighAccuracy: true });
        } else {
            navigator.geolocation.clearWatch(app.gpsWatchID);
        }
    },

    onGpsSuccess: function (position) {
        app.position = position;
    },
    onGpsError: function (error) {
        document.getElementById('gpsPosition').innerHTML = error.message;
        navigator.geolocation.clearWatch(app.gpsWatchID);
        document.getElementById('gps').checked = false;
    }

};

app.initialize();
