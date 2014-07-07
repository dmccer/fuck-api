var page = require('webpage').create();

var OAUTH_URL = 'https://sso.51ping.com/oauth2.0/authorize?client_id=apollo&redirect_uri=http://apollo_oauth_callback';
var CALLBACK_URL = 'http://apollo_oauth_callback';
var GET_TOKEN_URL = 'https://apollo.dper.com/cu/oauth/tokens';
var GET_TOKENS_URL = 'https://sso.51ping.com/oauth2.0/accessToken';

var ticket;
var cookieStack;

var setTicket = function (url) {
  var queryStr = url.split('?')[1];

  console.log('------------------\nset ticket\n-------------------');
  ticket = queryStr.split('=')[1];
}

var queryTokens = function () {
  console.log('start get token url')

  page.open(GET_TOKEN_URL, 'post', toQueryString({
    serviceTicket: ticket
  }), {
    Cookie: cookieStack
  }, function (status) {
    if (status == 'success') {
      console.log('get token url success')
      phantom.exit();
    } else {
      console.log('err')
    }
  });
}

page.onResourceRequested = function(request, networkRequest) {
  // if (request.url.indexOf(CALLBACK_URL) === 0) {
  //   setTicket(request.url);
    
  //   // networkRequest.abort();
    
  //   console.log('=============================')
  // }
  console.log('Request ' + JSON.stringify(request, undefined, 4));
};

page.onResourceReceived = function(response) {
  // if (response.status == 302) {
  //   console.log('Receive ' + JSON.stringify(response, undefined, 4));  
  // }
  // console.log('Receive ' + JSON.stringify(response, undefined, 4));
  // response.headers['set-cookie']
};

var formatCookie = function (cookies) {
  var cookiesTmp = [];
  cookies.map(function (cookie) {
    return cookiesTmp.push(cookie.name + '=' + cookie.value);
  });
  return cookiesTmp.join('; ');
}

var toQueryString = function (o) {
  var rs = [];

  for (var key in o) {
    if (o.hasOwnProperty(key)) {
      rs.push(encodeURIComponent(key) + '=' + encodeURIComponent(o[key]));
    }
  }

  return rs.join('&');
}

page.open(OAUTH_URL, function(status) {
  var formData;

  if (status == 'success') {

    formData = page.evaluate(function() {
      return {
        lt: document.querySelector('input[name="lt"]').value,
        execution: document.querySelector('input[name="execution"]').value,
        _eventId: document.querySelector('input[name="_eventId"]').value,
        actionUrl: document.querySelector('#fm1').action
      }
    });

    cookieStack = formatCookie(page.cookies);

    console.log('-----------------\nfirst page cookies\n--------------------')
    console.log(cookieStack)

    console.log('-----------------\nform info from server\n-------------------')
    console.log(JSON.stringify(formData));

    if (formData && typeof formData == 'object') {
      formData.username = 1;
      formData.password = 'dp,12345';
      // formData.username = '9000310';
      // formData.password = 'Yunhua190926xiao';

      console.log('-----------------\nto submit data\n------------------')
      console.log(JSON.stringify(formData));

      console.log('-----------------\nstart submit form\n------------------')

      var actionUrl = formData.actionUrl;
      delete formData.actionUrl;

      var qs = toQueryString(formData);
      console.log(qs)

      page.open(actionUrl, 'post', qs, {
        Cookie: cookieStack
      }, function (status) {
        if (status == 'success') {
          console.log('-----------------\nsubmit form ok\n------------------')
          console.log(page.url)
        } else {
          queryTokens();
        }
      });
    } else {
      console.log('eerr')
    }
  }
});
