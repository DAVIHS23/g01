d3.queue()
  .defer(d3.json, "data/globalMap.json")
  .defer(d3.csv, "data/population3.csv", function(row) {
    return {
      country: row.country,
      countryCode: row.locationCode,
      countryCodeISO: row.countryCodeISO,
      population: +row.population1Jan * 1000,
      density: +row.populationDensity1Jul,
      year: +row.year,
      femalePopulation: +row.femalePopulation1Jul * 1000,
      malePopulation: +row.malePopulation1Jul * 1000,
      births: +row.births * 1000,
      deaths: +row.deaths * 1000,
      migration: +row.netMigrants * 1000
    }
  })
  .await(function(error, mapData, data) {
    if (error) throw error;

    var extremeYears = d3.extent(data, d => d.year);
    var currentYear = extremeYears[0];
    var currentDataType = d3.select('input[name="data-type"]:checked').attr("value");
    var geoData = topojson.feature(mapData, mapData.objects.countries).features;

    //var width = +d3.select(".chart-container").node().offsetWidth;
    var width = 900;
    var height = 300;
    var mapHeight = 520;
    var mapWidth = 900;

    createMap(mapWidth, mapHeight);
    createBar(width, height);
    drawMap(geoData, data, currentYear, currentDataType);
    drawBar(data, currentDataType, "");
    updateGenderCounters(data, currentYear);
    drawMigrationsGraph(data, "");
    drawNewPie(data, currentYear);

    d3.select("#year")
        .property("min", currentYear)
        .property("max", extremeYears[1])
        .property("value", currentYear)
        .on("input", () => {
          currentYear = +d3.event.target.value;
          drawMap(geoData, data, currentYear, currentDataType);
          highlightBars(currentYear);
          highlightBars(currentYear);
          updateNewPie(data, currentYear);
        });

    d3.selectAll('input[name="data-type"]')
        .on("change", () => {
          var active = d3.select(".active").data()[0];
          var country = active ? active.properties.country : "";
          currentDataType = d3.event.target.value;
          drawMap(geoData, data, currentYear, currentDataType);
          drawBar(data, currentDataType, country);
          drawMigrationsGraph(data, country);
          drawMigrationsGraph(data, country);
        });

    d3.selectAll("svg")
        .on("mousemove touchmove", updateTooltip);

    function updateTooltip() {
      var tooltip = d3.select(".tooltip");
      var tgt = d3.select(d3.event.target);
      var isCountry = tgt.classed("country");
      var isBar = tgt.classed("bar");
      var isArc = tgt.classed("arc");
      var dataType = d3.select("input:checked").property("value");
      var units = dataType === "population" ? "people" : "people per square km";
      var data;
      var percentage = "";
      if (isCountry) data = tgt.data()[0].properties;
      if (isArc) {
        data = tgt.data()[0].data;
        percentage = `<p>Percentage of total: ${getPercentage(tgt.data()[0])}</p>`;
      }
      if (isBar) data = tgt.data()[0];
      tooltip
          .style("opacity", +(isCountry || isArc || isBar))
          .style("left", (d3.event.pageX - tooltip.node().offsetWidth / 2) + "px")
          .style("top", (d3.event.pageY - tooltip.node().offsetHeight - 10) + "px");
      if (data) {
        var dataValue = data[dataType] ?
          data[dataType].toLocaleString() + " " + units :
          "Data Not Available";
        tooltip 
            .html(`
              <p>Country: ${data.country}</p>
              <p>${formatDataType(dataType)}: ${dataValue}</p>
              <p>Year: ${data.year || d3.select("#year").property("value")}</p>
              <p>Females: ${data.femalePopulation.toLocaleString('de-DE')} | ${((data.femalePopulation / data.population) * 100).toFixed(2)}%</p>
              <p>Males: ${data.malePopulation.toLocaleString('de-DE')} | ${((data.malePopulation / data.population) * 100).toFixed(2)}%</p>
              ${percentage}
            `)
      }
    }
  });

function formatDataType(key) {
  return key[0].toUpperCase() + key.slice(1).replace(/[A-Z]/g, c => " " + c);
}

function getPercentage(d) {
  var angle = d.endAngle - d.startAngle;
  var fraction = 100 * angle / (Math.PI * 2);
  return fraction.toFixed(2) + "%";
}