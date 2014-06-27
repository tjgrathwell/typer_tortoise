$(document).ready(function () {
  var queryParams = function () {
    // substr is to remove the leading question mark
    var params = window.location.search.substr(1).split('&');
    var result = {};
    params.forEach(function (item) {
      var pair = item.split('=');
      result[pair[0]] = result[pair[1]];
    });
    return result;
  };

  var objectToQPString = function (obj) {
    var strComponents = [];
    for (var key in obj) {
      if (!key || !obj.hasOwnProperty(key)) {
        continue;
      }
      strComponents.push(key + '=' + obj[key]);
    }
    return strComponents.join('&');
  };

  $('#category_filter').change(function () {
    var query = queryParams();
    if (!$(this).val()) {
      delete query[$(this).attr('name')];
    } else {
      query[$(this).attr('name')] = $(this).val();
    }
    window.location.search = objectToQPString(query);
  });
});
