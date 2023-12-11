var currentCountryName = "";

function createMap(width, height) {
  d3.select("#map")
      .attr("width", width)
      .attr("height", height)
    .append("text")
      .attr("x", width / 2)
      .attr("y", "1em")
      .attr("font-size", "1.5em")
      .style("text-anchor", "middle")
      .classed("map-title", true);
}

function createLegend(map, domains, colors, dataType) {
  map.select(".legend").remove();
  // Position der Legende festlegen
  var legendX = map.attr("width") - 100; // Ändern Sie diesen Wert für eine andere Position
  var legendY = map.attr("height") - 300; // Ändern Sie diesen Wert für eine andere Position

  var legend = map.append("g")
                  .attr("class", "legend")
                  .attr("transform", "translate(" + legendX + "," + legendY + ")");

  var legendItemSize = 20;
  var legendSpacing = 5;
  var domain = domains[dataType];
  var colorScale = d3.scaleLinear().domain(domain).range(colors[dataType]);

  domain.forEach((d, i) => {
    var legendItem = legend.append("g")
                           .attr("transform", "translate(0," + (i * (legendItemSize + legendSpacing)) + ")");

    legendItem.append("rect")
              .attr("width", legendItemSize)
              .attr("height", legendItemSize)
              .attr("fill", colorScale(d));

    if (d < 1000000) {
      d = (d / 1000) + " Tsd."
    } else if (d >= 1000000 && d < 1000000000) {
      d = (d / 1000000) + " Mio."
    } else if (d >= 1000000000) {
      d = (d / 1000000000) + " Mia."
    }

    legendItem.append("text")
              .attr("x", legendItemSize + legendSpacing)
              .attr("y", legendItemSize - legendSpacing)
              .text(d);
  });
}

function drawMap(geoData, climateData, year, dataType) {
  var map = d3.select("#map");

  var projection = d3.geoMercator()
                     .scale(110)
                     .translate([
                       +map.attr("width") / 2,
                       +map.attr("height") / 1.4
                     ]);

  var path = d3.geoPath()
               .projection(projection);

  d3.select("#year-val").text(year);

  geoData.forEach(d => {
    var countries = climateData.filter(row => row.countryCode === d.id);
    var name = '';
    if (countries.length > 0) name = countries[0].country;
    d.properties = countries.find(c => c.year === year) || { country: name };
  });

  var domains = {
    population: [0, 5e4, 1e5, 5e5, 1e6, 5e6, 1e7, 5e7, 1e8, 5e8, 1e9, 1.4e9],
    density: [0, 10, 50, 100, 300, 500, 1000, 2000, 5000, 10000]
  };
  
  var colors = {
    population: ["#e0f7fa", "#cceff9", "#b2e8f8", "#99e1f7", "#80dbf6", "#66d4f5", "#4dcef4", "#33c7f3", "#1ac0f2", "#00b9f1", "#00a1cf", "#0089ad"],
    density: ["#ffcccc", "#ff9999", "#ff6666", "#ff3333", "#ff0000", "#cc0000", "#990000", "#660000", "#330000", "#000000"]
  };

  var mapColorScale = d3.scaleLinear()
                        .domain(domains[dataType])
                        .range(colors[dataType]);

  var update = map.selectAll(".country")
                  .data(geoData);

  update
    .enter()
    .append("path")
      .classed("country", true)
      .attr("d", path)
      .on("click", function() {
        var currentDataType = d3.select("input:checked")
                                .property("value");
        var country = d3.select(this);
        var isActive = country.classed("active");
        var countryName = isActive ? "" : country.data()[0].properties.country;
        currentCountryName = countryName;
        drawBar(climateData, currentDataType, countryName);
        updateGenderCounters(climateData, +d3.select("#year").property("value"), countryName);
        drawMigrationsGraph(climateData, countryName);
        highlightBars(+d3.select("#year").property("value"));
        d3.selectAll(".country").classed("active", false);
        country.classed("active", !isActive);  
      })
    .merge(update)
      .transition()
      .duration(750)
      .attr("fill", d => {
        var val = d.properties[dataType];
        return val ? mapColorScale(val) : "#ccc";
      });

  d3.select(".map-title")
      .text("Global " + graphTitle(dataType) + ", " + year);

  if (currentCountryName != "") {
    updateGenderCounters(climateData, year, currentCountryName);
  } else if (currentCountryName == undefined) {
    currentCountryName = "";
    updateGenderCounters(climateData, year);
  } else if (currentCountryName == "") {
    updateGenderCounters(climateData, year);
  }
  
  createLegend(map, domains, colors, dataType);
}

function graphTitle(str) {
  return str.replace(/[A-Z]/g, c => " " + c.toLowerCase());
}