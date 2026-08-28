(function () {
  var target = window.BneiRoute && BneiRoute.shimTarget(location);
  if (target) location.replace(target);
})();
