// app.js
var http = require('http');

var fs = require('fs');		//引入文件读取模块
var url = require('url');
var path = require('path');
var zlib = require("zlib");

var mime = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "text/plain",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml",
    "fmi": "image/png"
};

// var documentRoot = 'C:/Users/easyfrog/Desktop/threetest';
var documentRoot = process.cwd();

http.createServer(function(req,response){
	var pathname = url.parse(req.url).pathname;
    //客户端输入的url，例如如果输入localhost:8888/index.html
    //那么这里的url == /index.html

    var realPath = path.join(documentRoot, path.normalize(pathname.replace(/\.\./g, "")));
	fs.exists(realPath, function (exists) {
		if (!exists) {
			response.writeHead(404, {
			'Content-Type': 'text/plain'
		});

			response.write("This request URL " + pathname + " was not found on this server.");
			response.end();
		} else {
		  fs.readFile(realPath, "binary", function (err, file) {
			if (err) {
				response.writeHead(500, {
					'Content-Type': 'text/plain'
				});

				response.end(err);
			} else {
				var ext = path.extname(realPath);
				ext = ext ? ext.slice(1) : 'unknown';
				var contentType = mime[ext] || "text/plain";
				response.writeHead(200, {
					'content-type' : contentType
				});

				response.write(file, "binary");

				response.end();
			}
		  });
		}
	});
}).listen(8084, '0.0.0.0', function() {
    console.log('Https server listening on port 8084');
});
