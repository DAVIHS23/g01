function drawNewPie(data, currentYear) {
    // Filter data for the specified year
    var filteredData = data.filter(d => d.year === currentYear);
  
    // Sort data by births in descending order
    filteredData.sort((a, b) => b.births - a.births);
  
    // Take the top 20 countries
    var topCountries = filteredData.slice(0, 10);
  
    // Extract relevant information for the pie chart
    var pieData = topCountries.map(d => ({
      countryCodeISO: d.countryCodeISO,
      value: d.births,
    }));
  
    // Set up pie chart parameters
    var width = 450;
    var height = 450;
    var radius = Math.min(width, height) / 2;
  
    // Different color scheme
    var colors = d3.schemeCategory20;
  
    // Container for the SVG element
    var container = d3.select("#birth-pie")
      .style("margin-top", "20px");
  
    // Add title
    container.append("div")
      .attr("class", "chart-title")
      .text("Top 10 Countries - Births (" + currentYear + ")")
      .style("padding-left", "9%")
      .style("font-weight", "bold");
  
    // Create SVG element
    var svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  
    // Create pie chart
    var pie = d3.pie().value(d => d.value);
    var path = d3.arc().outerRadius(radius - 10).innerRadius(0);
  
    var arc = svg.selectAll("arc")
      .data(pie(pieData))
      .enter()
      .append("g")
      .attr("class", "arc");
  
    arc.append("path")
      .attr("d", path)
      .attr("fill", (d, i) => colors[i % colors.length]); // Use a different color for each slice
  
    // Add labels with countryCodeISO and births
    arc.append("text")
    .attr("transform", d => "translate(" + path.centroid(d) + ")")
    .attr("dy", "0.4em")
    .style("font-weight", "bold")
    .style("font-color", "white")
    .text(d => `${d.data.countryCodeISO}: ${formatNumber(d.value)}`);

  console.log(pieData);
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