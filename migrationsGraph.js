// Function to draw or update the migrations graph
function drawMigrationsGraph(data, country) {
  d3.select("#migrationsGraph").selectAll("*").remove();
  // Filter data for the specified country
  var filteredData = data.filter((d) => d.country === country);

  // Ensure the year is a number, not a string
  filteredData.forEach((d) => {
    d.year = +d.year; // Convert year to a number if it's a string
    d.migration = +d.migration; // Ensure migration is a number
  });

  // Set the dimensions and margins of the graph
  var margin = { top: 100, right: 30, bottom: 30, left: 100 },
    width = 750 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

  // Append the svg object to the specified container
  var svg = d3
    .select("#migrationsGraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Hinzufügen des Titels
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "21px")
    .text("Migration data for " + (country || "selected country"));

  // Hinzufügen des Untertitels
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2 + 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Chose a timeframe in the graph to see a more detailed view");

  // Adjust the x-axis to be a linear scale representing years
  var x = d3
    .scaleLinear()
    .domain(
      d3.extent(filteredData, function (d) {
        return d.year;
      })
    )
    .range([0, width]);

  // Adjust the y-axis to cover all data including negative values
  var y = d3
    .scaleLinear()
    .domain(
      d3.extent(filteredData, function (d) {
        return d.migration;
      })
    ) // Use extent to cover negative values
    .range([height, 0]);

  // Add X and Y axes
  var xAxis = svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // Format years as integers

  var yAxis = svg.append("g").call(d3.axisLeft(y));

  // Add a clipPath: everything out of this area won't be drawn.
  var clip = svg
    .append("defs")
    .append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

  // Create the area variable: where both the area and the brush take place
  var area = svg.append("g").attr("clip-path", "url(#clip)");

  // Create an area generator
  var areaGenerator = d3
    .area()
    .x(function (d) {
      return x(d.year);
    })
    .y0(y(0))
    .y1(function (d) {
      return y(d.migration);
    });

  // Add the area
  area
    .append("path")
    .datum(filteredData)
    .attr("class", "myArea")
    .attr("fill", "#00b9f1")
    .attr("fill-opacity", 0.3)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("d", areaGenerator);

  // Add brushing
  var brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("end", updateChart);

  area.append("g").attr("class", "brush").call(brush);

  // A function that set idleTimeOut to null
  var idleTimeout;
  function idled() {
    idleTimeout = null;
  }

  // A function that update the chart for given boundaries
  function updateChart() {
    var extent = d3.event.selection;

    if (!extent) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
      x.domain([4, 8]);
    } else {
      x.domain([x.invert(extent[0]), x.invert(extent[1])]);
      area.select(".brush").call(brush.move, null);
    }

    xAxis
      .transition()
      .duration(1000)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));
    area.select(".myArea").transition().duration(1000).attr("d", areaGenerator);
  }

  // If user double click, reinitialize the chart
  svg.on("dblclick", function () {
    x.domain(
      d3.extent(filteredData, function (d) {
        return d.year;
      })
    );
    xAxis.transition().call(d3.axisBottom(x).tickFormat(d3.format("d")));
    area.select(".myArea").transition().attr("d", areaGenerator);
  });
}
