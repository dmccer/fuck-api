;(function () {
  var $method = $('[data-id="method"]');
  var $postDataType = $('[data-id="post-data-type"]');

  $method.on('blur', function () {
    var method = $.trim($(this).val()).toLowerCase();

    $postDataType[method == 'post' ? 'removeClass' : 'addClass']('hide');
  })

})();