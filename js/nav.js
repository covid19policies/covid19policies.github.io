window.nav = {
  map: "world"
};

var worldNavButton = document.getElementById("nav-world");
var usNavButton = document.getElementById("nav-us");

worldNavButton.addEventListener("click", () => {
  var prev = window.nav.map;
  window.nav.map = "world";
  if (prev !== "world") {
    window.initMap && window.initMap();
  }
});

usNavButton.addEventListener("click", () => {
  var prev = window.nav.map;
  window.nav.map = "us";
  if (prev !== "us") {
    window.initMap && window.initMap();
  }
});
