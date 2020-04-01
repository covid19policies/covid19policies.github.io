
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
    $(".en").removeClass("hidden");
  }
});

// Filters nav
if (window.location.href.match("#US")) {
  $("#nav-us").addClass("active");
  $("#nav-world").removeClass("active");
}
if (window.location.href.match("#world")) {
  $("#nav-us").removeClass("active");
  $("#nav-world").addClass("active");
}

jQuery(document).ready(function($) {
  $("#nav-world").click(function(e) {
    if ($("#nav-world").hasClass("active")) {
      $("#nav-world").addClass("active");
    } else {
      $("#nav-world").addClass("active");
      $("#nav-us").removeClass("active");
    }
  });
});

jQuery(document).ready(function($) {
  $("#nav-us").click(function(e) {
    if ($("#nav-us").hasClass("active")) {
      $("#nav-us").addClass("active");
    } else {
      $("#nav-world").removeClass("active");
      $("#nav-us").addClass("active");
    }
  });
});

