var format = d3.format(",");

var wordings = [
  {
    level: -1,
    wording: "No data"
  },
  {
    level: 0,
    wording: "No action taken yet "
  },
  {
    level: 1,
    wording: "Loose lockdown policy"
  },
  {
    level: 2,
    wording: "Strong lockdown policy"
  },
  {
    level: 3,
    wording: "Outbreak stabilized for now"
  },
]

// var margin = {top: 0, right: 0, bottom: 0, left: 0},
//             width = 960 - margin.left - margin.right,
//             height = 500 - margin.top - margin.bottom;
var chartDiv = document.getElementById("map-area");
// var margin = {top: 0, right: 0, bottom: 0, left: 0};

var color = d3.scaleThreshold()
    .domain([-10,0,0.5,1.5,2.5,3])
    .range(["#C4C4C4", "#C4C4C4", "#FFFFFF", "#F3AD44", "#C31E39", "#7D1829"]);


window.initMap = function() {
  window.clearMap && window.clearMap();
  var currentMap = (window.nav && window.nav.map) || "world";
  // Set tooltips
  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      var word = wordings.find(w => w.level === d.level);
      if (currentMap === "world") {
        return "<strong>Country: </strong><span class='details'>" +
        d.properties.name +
        "<br></span>" +
        "<strong>" +
        (word && word.wording) || wordings[0].wording +
        "</strong>";
      } else if (currentMap === "us") {
        return "<strong>State: </strong><span class='details'>" +
        d.properties.name +
        "<br></span>" +
        "<strong>" +
        (word && word.wording) || wordings[0].wording +
        "</strong>";
      }
    });

  var path = d3.geoPath();

  var svgRoot = d3.select("#map-area")
              .append("svg");
  var svg = svgRoot.append('g')
  .attr('class', 'map');

  svg.call(tip);

  var dataSources;
  if (currentMap === "world") {
    dataSources = {
      map: "maps/world_countries_modified.json",
      data: "data/current_global.tsv"
    };
  } else if (currentMap === "us") {
    dataSources = {
      map: "maps/us_states.json",
      data: "data/current_US.tsv"
    };
  }

  queue()
      .defer(d3.json, dataSources.map)
      .defer(d3.tsv, dataSources.data)
      .await(ready);
  var countries,names;
  function ready(error, data, population) {
    var populationById = {};

    population.forEach(function(d) { populationById[d.id] = +d.level; });
    data.features.forEach(function(d) {
      if (isNaN(populationById[d.id])) {
        d.level = -1;
      } else {
        d.level = populationById[d.id]
      }
    });

    function draw() {
      countries && countries.remove();
      names && names.remove();
      var width = chartDiv.clientWidth;
      var ratio = Math.round(width*0.613);
      var height = ratio > 800? 800 : ratio;
      var projection;
      if (currentMap === "world") {
        projection = d3.geoMercator()
          .scale(Math.round(height*0.26))
          .translate( [width / 2, height / 1.5]);
      } else if (currentMap === "us") {
        projection = d3.geoAlbersUsa()
          .scale(Math.round(height*2))
          .translate([width/2, height/2]);
      }

      var path = d3.geoPath().projection(projection);
      svgRoot.attr("width", width)
      .attr("height", height);
      countries = svg.append("g")
          .attr("class", "countries")
          .selectAll("path")
          .data(data.features)
        .enter().append("path")
          .attr("d", path)
          .style("fill", function(d) { return color(d.level); })
          .style('stroke', '#302828')
          .style('stroke-width', 0.2)
          .style("opacity",1)
          .on('mouseover',function(d){
            tip.show(d);

            d3.select(this)
              .style("opacity", 1)
              .style("stroke","#302828")
              .style("stroke-width",2);
          })
          .on('mouseout', function(d){
            tip.hide(d);

            d3.select(this)
              .style("opacity", 1)
              .style("stroke","#302828")
              .style("stroke-width",0.2);
          });
          // tip.style("stroke","white")
          // .style('stroke-width', 0.3)

      // names = svg.append("path")
      //     .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
      //      // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
      //     .attr("class", "names")
      //     .attr("d", path);
    }
    draw();
    // Redraw based on the new size whenever the browser window is resized.
    window.addEventListener("resize", draw);
    window.clearMap = function() {
      window.removeEventListener("resize", draw);
      svgRoot.remove();
    }
  }
};

if (window.navInitiatied) {
  window.initMap();
}
