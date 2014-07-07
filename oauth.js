var https = require('https');
var querystring = require('querystring');
var http = require('http')
var fs = require('fs')
var Apricot = require('apricot').Apricot;

// beta
// https://sso.51ping.com

/* GET home page. */
var CB_URL = 'http://apollo_oauth_callback';
var OAUTH_URL = 'https://sso.51ping.com/oauth2.0/authorize?client_id=apollo&redirect_uri=http://apollo_oauth_callback';
var GET_TOKEN_URL = 'http://apollo.51ping.com/cu/oauth/tokens';

var loginSubmitHostname;
var cookies;

var cookieCollect = function(cookies) {
  var o = [];

  cookies.forEach(function(cookie) {
    o.push(cookie.split(';')[0])
  });

  return o;
}

var queryTokens = function(ticket, cookieStr) {
  console.log(ticket, cookieStr);

  var httpsReq = https.request({
    hostname: 'apollo.51ping.com',
    path: '/cu/oauth/tokens',
    method: 'POST',
    headers: {
      'Cookie': cookieStr,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function(res) {
    console.log(res.statusCode)
    console.log(res.headers)
  })

  httpsReq.on('error', function(e) {
    console.log('error ' + e.message)
  })

  httpsReq.write(querystring.stringify({
    serviceTicket: ticket
  }));

  httpsReq.end();
}

var request = function(path, data) {
  var cookieStr = cookieCollect(cookies).join('; ');

  var options = {
    hostname: loginSubmitHostname,
    path: '/login',
    method: 'POST',
    headers: {
      'Cookie': cookieStr,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  var _cookies;

  var ticket1;
  var ticket2;

  var req = https.request(options, function(res) {

    if (res.statusCode == 302) {
      _cookies = res.headers['set-cookie'];

      ticket1 = res.headers.location.split('?')[1];
      var _cookieStr = cookieCollect(res.headers['set-cookie']).join('; ');
      var httpReq = http.request({
        hostname: 'sso.dper.com',
        path: '/oauth2.0/callbackAuthorize?' + ticket1,
        method: 'GET',
        headers: {
          'Cookie': _cookieStr
        }
      }, function(res) {
        if (res.statusCode == 302) {
          ticket2 = res.headers.location.split('?')[1];

          var httpsReq = https.request({
            hostname: 'sso.dper.com',
            path: '/oauth2.0/callbackAuthorize?' + ticket1,
            method: 'GET',
            headers: {
              'Cookie': _cookieStr + '; ' + cookieStr
            }
          }, function(res) {
            if (res.statusCode == 302) {
              var codeStr = res.headers.location.split('?')[1];

              var codeStrArr = codeStr.split('=');

              var code = codeStrArr[1];

              queryTokens(code, _cookieStr + '; ' + cookieStr);
            }
          });

          httpsReq.on('error', function(e) {
            console.log('httpsReq error ' + e.message)
          })

          httpsReq.end();

          // https.get(res.headers.location, function(res) {
          //   console.log(res.statusCode)
          //   console.log(res.headers)
          //   var html = '';
          //   res.on('data', function(chunk) {
          //     html += chunk;
          //   })

          //   res.on('end', function() {
          //     console.log(html)
          //   })
          // })
        }
      });

      httpReq.on('error', function(e) {
        console.log('http req err' + e.message);
      })

      httpReq.end();

      // http.get(res.headers.location, function(res) {
      //   if (res.statusCode == 302) {
      //     ticket2 = res.headers.location.split('?')[1];
      //     console.log(ticket2)

      //     https.get(res.headers.location, function(res) {
      //       console.log(res.statusCode)
      //       console.log(res.headers)
      //       var html = '';
      //       res.on('data', function(chunk) {
      //         html += chunk;
      //       })

      //       res.on('end', function() {
      //         console.log(html)
      //       })
      //     })
      //   }
      // })
    }
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  // write data to request body
  req.write(querystring.stringify(data));
  req.end();
}

// username
// password
// lt
// execution
// _eventId = submit

// 忘记密码 http://account.dper.com/public/index.jsp#/reset/account
var getLoginHtml = function(loginUrl) {
  https.get(loginUrl, function(res) {
    var html = '';

    res.on('data', function(chunk) {
      html += chunk;
    });

    res.on('end', function() {
      Apricot.parse(html, function(err, doc) {
        var lt = doc.document.querySelector('input[name="lt"]').value;
        var execution = doc.document.querySelector('input[name="execution"]').value;
        var _eventId = doc.document.querySelector('input[name="_eventId"]').value;

        var actionUrl = doc.document.querySelector('#fm1').action;

        var path = actionUrl.substring(0, actionUrl.indexOf('?'));

        var username = 1;
        var password = 'dp,12345';

        // var username = '9000310';
        // var password = 'Yunhua190926xiao';

        request(path, {
          lt: lt,
          execution: execution,
          _eventId: _eventId,
          username: username,
          password: password
        });
      })
    });
  })
};

var getHostname = function(location) {
  var protocol = 'https://';
  var tmp = location.replace(protocol, '');

  var pathSeperateIndex = tmp.indexOf('/');
  // var queryStartIndex = tmp.indexOf('?');

  var hostname = tmp.substring(0, pathSeperateIndex);
  // var path = tmp.substring(pathSeperateIndex, queryStartIndex);
  return hostname;
}

// var req = https.request({
//   host: 'sso.51ping.com',
//   path: '/oauth2.0/authorize?client_id=apollo&redirect_uri=http://apollo_oauth_callback',
//   method: 'GET'
// }, function (res) {
//   console.log(res.headers)
// });

// req.on('error', function (e) {
//   console.log('err ' + e.message)
// })

// req.end();


https.get(OAUTH_URL, function(res) {
  if (res.statusCode == 302) {
    cookies = res.headers['set-cookie'];

    var tmpArr = res.headers['set-cookie'][0].split(';')[0].split('=');

    var key = tmpArr[0].toLowerCase();
    var val = tmpArr[1];

    var location = res.headers.location;

    loginSubmitHostname = getHostname(location);

    var index = location.indexOf('?');

    var url = location.substring(0, index);

    url += ';' + key + '=' + val + location.substring(index);

    console.log(url);

    getLoginHtml(url)
  }

}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
