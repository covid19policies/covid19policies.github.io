var format = d3.format(",");

// Set tooltips
var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Level: </strong><span class='details'>" + format(d.level) +"</span>";
            })

// var margin = {top: 0, right: 0, bottom: 0, left: 0},
//             width = 960 - margin.left - margin.right,
//             height = 500 - margin.top - margin.bottom;
var chartDiv = document.getElementById("map-area");
// var margin = {top: 0, right: 0, bottom: 0, left: 0};

var color = d3.scaleThreshold()
    .domain([0,0.5,1.5,3])
    .range(["rgb(255,255,255)", "rgb(255,255,255)", "rgb(248,124,8)", "rgb(249,47,21)"]);

var path = d3.geoPath();

var svgRoot = d3.select("#map-area")
            .append("svg");

var svg = svgRoot.append('g')
.attr('class', 'map');

svg.call(tip);

queue()
    .defer(d3.json, "data/world_countries.json")
    .defer(d3.tsv, "data/world_measures.tsv")
    .await(ready);
var countries,names;
function ready(error, data, population) {
  var populationById = {};

  population.forEach(function(d) { populationById[d.id] = +d.level; });
  data.features.forEach(function(d) { d.level = populationById[d.id] });
  function draw() {
    countries && countries.remove();
    names && names.remove();
    var width = chartDiv.clientWidth;
    var height = Math.round(width*0.5);
    console.log(width);
    console.log(height);
    var projection = d3.geoMercator()
                       .scale(Math.round(height/50*13))
                      .translate( [width / 2, height / 1.5]);

    var path = d3.geoPath().projection(projection);
    svgRoot.attr("width", width)
    .attr("height", height);
    countries = svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(data.features)
      .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) { return color(populationById[d.id]); })
        .style('stroke', '#32383e')
        .style('stroke-width', 0.3)
        .style("opacity",1)
        .on('mouseover',function(d){
          tip.show(d);

          d3.select(this)
            .style("opacity", 1)
            .style("stroke","#32383e")
            .style("stroke-width",3);
        })
        .on('mouseout', function(d){
          tip.hide(d);

          d3.select(this)
            .style("opacity", 1)
            .style("stroke","#32383e")
            .style("stroke-width",0.3);
        });
        // tip.style("stroke","white")
        // .style('stroke-width', 0.3)

    names = svg.append("path")
        .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
         // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
        .attr("class", "names")
        .attr("d", path);
  }
  draw();
  // Redraw based on the new size whenever the browser window is resized.
  window.addEventListener("resize", draw);
}
