var https = require('https');
var http = require('http')
var querystring = require('querystring');
var url = require('url');
// dom parser
var Apricot = require('apricot').Apricot;

var async = require('async');

var protocolHandlerMap = {
  'http:': http,
  'https:': https
}

var HOST = 'sso.51ping.com';

// var CB_URL = 'http://apollo_oauth_callback';
// var OAUTH_URL = 'https://sso.51ping.com/oauth2.0/authorize?client_id=apollo&redirect_uri=http://apollo_oauth_callback';
// var GET_TOKENS_URL = 'https://sso.51ping.com/oauth2.0/accessToken';

var loginSubmitHostname;

// for login
var cookies;

var cookieCollect = function(cookies) {
  var o = [];

  cookies.forEach(function(cookie) {
    o.push(cookie.split(';')[0])
  });

  return o;
}

var queryTokens = function(ticket, cookieStr, fresh, callback) {
  var opts = {
    code: ticket,
    client_id: 'apollo',
    client_secret: 'secret',
    grant_type: 'code'
  };

  if (fresh) {
    opts.grant_type = 'token';
    opts.client_id = 'key';
  }
  
  var postData = querystring.stringify(opts);

  var httpsReq = https.request({
    hostname: HOST,
    path: '/oauth2.0/accessToken',
    method: 'POST',
    headers: {
      'Cookie': cookieStr,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    },
    ciphers: 'RC4'
  }, function(res) {
    var resTxt = '';

    if (res.statusCode === 200) {
      res.on('data', function (chunk) {
        resTxt += chunk;
      });

      res.on('end', function () {
        var resJson = JSON.parse(resTxt);
        resJson.cookieStr = cookieStr;
        resJson.ticket = ticket;

        callback(null, resJson);
      });
    } else {
      if (fresh) {
        console.log('refreshTokens 失败');
        console.log(res.statusCode);
        console.log(res.headers);
      }
    }
  })

  httpsReq.on('error', function(e) {
    console.log('error ' + e.message)
  })

  httpsReq.write(postData);

  httpsReq.end();
}

var forward = function (res, extraHeaders, success, error) {
  var cookies = res.headers['set-cookie'];

  var redirectUrlObj = url.parse(res.headers.location, true);

  var headers = extraHeaders || {};

  if (cookies) {
    if (headers.Cookie) {
      headers.Cookie = headers.Cookie + ';' + cookieCollect(cookies).join(';');
    } else {
      headers.Cookie = cookieCollect(cookies).join('; ');
    }
  }

  var opts = {
    host: redirectUrlObj.host,
    path: redirectUrlObj.path,
    headers: headers
  };

  if (redirectUrlObj.protocol === 'https:') {
    opts.ciphers = 'RC4';
  }

  protocolHandlerMap[redirectUrlObj.protocol].get(opts, success).on('error', error);
}

var login = function(submitHost, loginPath, cookies, data, callback) {
  console.log('正在登录...');

  var cookieStr = cookieCollect(cookies).join(';');

  var postData = querystring.stringify(data);

  var options = {
    host: submitHost,
    path: loginPath,
    method: 'POST',
    headers: {
      'Cookie': cookieStr,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    },
    ciphers: 'RC4'
  };

  var req = https.request(options, function(res) {
    var errorCallback = function (err) {
      console.log('获取 code 失败')
      console.log(err);
    };

    if (res.statusCode == 302) {
      console.log('登录成功，正在获取 code');

      forward(res, {
        Cookie: cookieStr
      }, function (_res) {
        if (_res.statusCode === 302) {
          forward(res, {
            Cookie: cookieStr
          }, function (res) {
            if (_res.statusCode === 302) {
              forward(res, {
                Cookie: cookieStr
              }, function (res) {
                if (res.statusCode === 302) {
                  var urlObj = url.parse(res.headers.location, true);
                  console.log('code 获取成功: ' + urlObj.query.code)
                  console.log('正在首次获取 tokens ...');

                  callback(null, urlObj.query.code, cookieStr, false);
                }
              }, errorCallback)
            }
          }, errorCallback)
        }
      }, errorCallback);
    } else {
      console.log('登录失败')
      console.log('headers: ')
      console.log(res.headers)

      var html = '';

      res.on('data', function (chunk) {
        html += chunk;
      });

      res.on('end', function () {
        console.log('服务器返回数据: \n' + html);
      });
    }
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.write(postData);
  req.end();
}

// 忘记密码 http://account.dper.com/public/index.jsp#/reset/account
var getLoginHtml = function(loginUrl, submitHost, cookies, username, password, callback) {
  console.log('请求 login page \n' + loginUrl);
  
  var loginUrlObj = url.parse(loginUrl);

  https.get({
    host: loginUrlObj.host,
    path: loginUrlObj.path,
    headers: {
      Cookie: cookieCollect(cookies).join(';')
    },
    ciphers: 'RC4'
  }, function(res) {
    var html = '';

    res.on('data', function(chunk) {
      html += chunk;
    });

    res.on('end', function() {
      console.log('收到 login page 正在解析页面');

      Apricot.parse(html, function(err, doc) {
        var lt = doc.document.querySelector('input[name="lt"]').value;
        var execution = doc.document.querySelector('input[name="execution"]').value;
        var _eventId = doc.document.querySelector('input[name="_eventId"]').value;
        var submitPath = doc.document.querySelector('#fm1').action;

        console.log('解析 login page 成功');

        callback(null, submitHost, submitPath, cookies, {
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

var auth = function (options, callback) {
  // step 1
  https.get({
    host: options.authHost,
    path: '/oauth2.0/authorize?client_id=' + options.clientId + '&redirect_uri=' + options.redirectUrl,
    method: 'GET',
    ciphers: 'RC4'
  }, function(res) {
    if (res.statusCode == 302) {
      var location = res.headers.location;

      // 缓存登录的 hostname, 供登录 submit 时用
      var urlObj = url.parse(location);

      callback(null, location, urlObj.host, res.headers['set-cookie']);
    }
  }).on('error', function (err) {
    console.log('step1');
    console.log(err);
  });
}

var OAuthHelper = function (authHost, username, password, clientId, clientSecret, redirectUrl) {
  this.options = {
    authHost: authHost,
    username: username,
    password: password,
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUrl: redirectUrl
  };
};

OAuthHelper.prototype.queryTokens = function (callback) {
  var self = this;

  if (this.oauthResult) {
    this.refreshTokens(this.oauthResult, callback);
    return;
  }

  async.waterfall([
    function (callback) {
      callback(null, self.options)
    },
    auth,
    function (loginUrl, submitHost, cookies, callback) {
      getLoginHtml(loginUrl, submitHost, cookies, self.options.username, self.options.password, callback);
    },
    login,
    queryTokens
  ], function (err, result) {
    self.oauthResult = result;

    callback(err, result)
  });
}

OAuthHelper.prototype.refreshTokens = function (oauthResult, callback) {
  var self = this;

  queryTokens(oauthResult.ticket, oauthResult.cookieStr, true, function (err, result) {
    self.oauthResult = result;

    callback(err, result);
  });
}

module.exports = OAuthHelper;

// var oAuthHelper = new OAuthHelper('sso.51ping.com', 1, 'dp,12345', 'apollo', 'secret', 'http://apollo_oauth_callback');

// oAuthHelper.queryTokens(function (err, result) {
//   console.log(result);
// })
