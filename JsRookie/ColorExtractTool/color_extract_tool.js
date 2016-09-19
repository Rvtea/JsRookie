'use strict'

$(function() {
    var fileInput = document.getElementById('image-file');
    var info = document.getElementById('file-info');
    var img_preview = document.getElementById('image-preview');
    var topColorDisplay = document.getElementById('colorDisplay');
    fileInput.addEventListener('change', function() {
        if (!fileInput.value) {
            info.innerHTML = '没有选择文件';
            return;
        }
        var file = fileInput.files[0];
        info.innerHTML = '文件: ' + file.name + '<br>' +
            '大小: ' + formatBytes(file.size, 1) + '<br>' +
            '修改: ' + file.lastModifiedDate;
        if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
            alert('不是有效的图片文件!');
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            // get image rgb info and process
            var img_obj = new Image();
            var colorInfo = new Map(); // store the rgb info, do not include alpha value now
            img_obj.src = e.target.result;
            img_obj.onload = function() {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                var img_width = this.width;
                var img_height = this.height;
                // set the size of canvas
                canvas.width = img_width;
                canvas.height = img_height;
                // draw image
                context.drawImage(this, 0, 0, img_width, img_height);
                // obtain image data
                let imageData = context.getImageData(0, 0, img_width, img_height);
                // process the stats
                var len = imageData.data.length;
                for (let i = 0; i < len; i += 4) {
                    let r = imageData.data[i],
                        g = imageData.data[i + 1],
                        b = imageData.data[i + 2];
                    let hex_info = rgbToHex(r, g, b);
                    if (!colorInfo[hex_info]) {
                        colorInfo[hex_info] = 1;
                    } else {
                        colorInfo[hex_info]++;
                    }
                };
                // convert object to array for sort function
                // var start = new Date().getTime();
                // var colorInfoArray = [];
                // for (var k in colorInfo) {
                //     colorInfoArray.push([k, colorInfo[k]]);
                // }
                // var end = new Date().getTime();
                // var time = end - start;
                var start = new Date().getTime();
                var colorInfoArray = [];
                var colorInfoKeys = getSortedKeys(colorInfo);
                for (var k in colorInfoKeys) {
                    colorInfoArray.push([colorInfoKeys[k], colorInfo[colorInfoKeys[k]]]);
                }
                var end = new Date().getTime();
                var time = end - start;
                var topResults = colorInfoArray;
                // sort will change the origin array, no need to add new var for record
                // var topResults = colorInfoArray.sort(function(a, b) {
                //     return a[1] < b[1] ? 1 : -1; // "<" means DESC,  ">" means ASC
                // }); // return the top 5
                var topFive = topResults.slice(0, 5);
                console.log(topFive);

                // clear all children under display if exist
                while (topColorDisplay.firstChild) {
                    topColorDisplay.removeChild(topColorDisplay.firstChild);
                }
                // loop to display all
                for (let i = 0; i < 5; i++) {
                    // display the top 5 colors using canvas
                    var canvas1 = document.createElement('canvas');
                    var ctx = canvas1.getContext('2d');
                    canvas1.width = 100;
                    canvas1.height = 45;
                    // place canvas in <li> within <ul> element
                    let listEle = document.createElement('li');
                    $('#colorDisplay li').css({
                        'float': 'left'
                    }); // do not forget the '' for each side bewteen :
                    topColorDisplay.appendChild(listEle);

                    // set the size of canvas
                    let horLen = 100,
                        rectWidth = 75,
                        rectHeight = 45;
                    // draw image
                    ctx.fillStyle = topFive[i][0];
                    ctx.fillRect(0, 0, rectWidth, rectHeight);
                    listEle.appendChild(canvas1);
                }
                console.log("Done.");
            };
            // preview
            if (img_preview) {
                img_preview.setAttribute('src', e.target.result);
            } else {
                img_preview = document.createElement('img');
                img_preview.setAttribute('id', 'image-preview');
                img_preview.setAttribute('src', e.target.result);
                document.getElementById('image-preview-before').appendChild(img_preview);
            }
        }
        reader.readAsDataURL(file);
    });
});

// thanks to http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Byte';
    var k = 1000; // or 1024 for binary
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// thanks to http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// thanks to http://stackoverflow.com/questions/5199901/how-to-sort-an-associative-array-by-its-values-in-javascript
function getSortedKeys(obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys.sort(function(a, b) {
        return obj[b] - obj[a];
    });
}