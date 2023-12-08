function drawDeathPie(data, currentYear) {
  var filteredData = data.filter((d) => d.year === currentYear);

  filteredData.sort((a, b) => b.deaths - a.deaths);

  var topCountries = filteredData.slice(0, 5);

  var pieData = topCountries.map((d) => ({
    countryCodeISO: d.countryCodeISO,
    value: d.deaths,
  }));

  var width = 250;
  var height = 250;
  var radius = Math.min(width, height) / 2;

  var colors = d3.schemeCategory20;

  var container = d3.select("#death-pie").style("margin-top", "20px");

  container
    .append("div")
    .attr("class", "chart-title")
    .text("Top 5 Countries - deaths (" + currentYear + ")")
    .style("padding-left", "5%")
    .style("font-weight", "bold");

  var svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var pie = d3.pie().value((d) => d.value);
  var path = d3
    .arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

  var arc = svg
    .selectAll("arc")
    .data(pie(pieData))
    .enter()
    .append("g")
    .attr("class", "arc");

  arc
    .append("path")
    .attr("d", path)
    .attr("fill", (d, i) => colors[i % colors.length]);

  var hoverRect = svg
    .append("rect")
    .attr("class", "hover-rect")
    .attr("width", 80)
    .attr("height", 20)
    .attr("rx", 5)
    .attr("ry", 5)
    .style("fill", "rgba(0, 0, 0, 0.7)")
    .style("display", "none");

  var hoverText = svg
    .append("text")
    .attr("class", "hover-text")
    .style("font-weight", "bold")
    .style("fill", "white")
    .style("text-anchor", "middle")
    .style("font-size", "10pt")
    .style("display", "none");

  arc
    .on("mouseover", function (d) {
      var pos = path.centroid(d);

      hoverRect
        .attr("x", pos[0] - 40)
        .attr("y", pos[1] - 20)
        .style("display", null);

      hoverText
        .attr("transform", "translate(" + pos + ")")
        .attr("dy", "-0.5em")
        .style("display", null)
        .text(`${d.data.countryCodeISO} : ${formatNumber(d.value)}`);
    })
    .on("mouseout", function () {
      hoverRect.style("display", "none");
      hoverText.style("display", "none");
    });
}

function updateDeathPie(data, currentYear) {
  var filteredData = data.filter((d) => d.year === currentYear);

  filteredData.sort((a, b) => b.deaths - a.deaths);

  var topCountries = filteredData.slice(0, 5);

  var pieData = topCountries.map((d) => ({
    countryCodeISO: d.countryCodeISO,
    value: d.deaths,
  }));

  var colors = d3.schemeCategory20;

  var width = 250;
  var height = 250;
  var radius = Math.min(width, height) / 2;

  var arc = d3
    .select("#death-pie")
    .select("svg")
    .selectAll(".arc")
    .data(d3.pie().value((d) => d.value)(pieData));

  // Update existing arcs
  arc
    .select("path")
    .transition()
    .attr(
      "d",
      d3
        .arc()
        .outerRadius(radius - 10)
        .innerRadius(0)
    )
    .attr("fill", (d, i) => colors[i % colors.length]);

  arc
    .select("text")
    .transition()
    .text((d) => `${d.data.countryCodeISO} : ${formatNumber(d.value)}`)
    .attr("transform", (d) => "translate(" + d3.arc().centroid(d) + ")");

  // Update title
  d3.select("#death-pie")
    .select(".chart-title")
    .text("Top 5 Countries - deaths (" + currentYear + ")");

  // Enter new arcs
  var enterArc = arc.enter().append("g").attr("class", "arc");

  enterArc
    .append("path")
    .attr(
      "d",
      d3
        .arc()
        .outerRadius(radius - 10)
        .innerRadius(0)
    )
    .attr("fill", (d, i) => colors[i % colors.length]);

  enterArc
    .append("text")
    .attr("transform", (d) => "translate(" + d3.arc().centroid(d) + ")")
    .attr("dy", "0.4em")
    .style("font-weight", "bold")
    .style("font-color", "white")
    .style("text-anchor", "middle")
    .style("font-size", "7pt")
    .text((d) => `${d.data.countryCodeISO} : ${formatNumber(d.value)}`);

  // Exit old arcs
  arc.exit().remove();
}

function formatNumber(value) {
  if (value >= 1e9) {
    return (value / 1e9).toFixed(1) + " Mia";
  } else if (value >= 1e6) {
    return (value / 1e6).toFixed(1) + " Mio";
  } else if (value >= 1e3) {
    return (value / 1e3).toFixed(1) + " Tsd";
  } else {
    return value.toFixed(1);
  }
}
