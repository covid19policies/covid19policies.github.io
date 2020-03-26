
var initNav = function() {
  var map = "world";
  if (window.location.hash) {
    if (window.location.hash === "#US" || window.location.hash === "#us") {
      map = "us";
    }
  }
  window.nav = {
    map: map
  };
  window.initMap && window.initMap();
  window.navInitiatied = true;
}

initNav();

var worldNavButton = document.getElementById("nav-world");
var usNavButton = document.getElementById("nav-us");

worldNavButton.addEventListener("click", () => {
  var prev = window.nav.map;
  window.nav.map = "world";
  window.location.hash = "#world";
  if (prev !== "world") {
    window.initMap && window.initMap();
  }
});

usNavButton.addEventListener("click", () => {
  var prev = window.nav.map;
  window.nav.map = "us";
  window.location.hash = "#US";
  if (prev !== "us") {
    window.initMap && window.initMap();
  }
});
