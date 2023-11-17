(function( map ) {
	/* Data and data processing */
	var world = {},
	data = {},
	queue = d3.queue,
	countryByIso = d3.map();

	/* Map size */
	var width = 1200, height = "600";

	/* Map settings */
	var svg = d3.select("#map").append("svg")
		.attr("width", width)
		.attr("height", height),
	projection = d3.geo.mercator()
	    .scale(390)
	    .translate([width * .5, height * 1.45]),
	path = d3.geo.path()
		.projection(projection);

	/* Map color scale */
  populationColor = d3.scale.linear().domain([1,10001,100001,1000001,10000001,100000001,1000000001]).range(["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"]);

	/* Info pane scale */
	var xMax = 320,
	xScale = d3.scale.linear()
	          .domain([0, 100])
	          .range([0, xMax]);

	var go = function(error, world, data) {

		// Access the country geometries
		var countries = topojson.feature(world, world.objects.ne_110m_admin_0_countries);
		svg.selectAll("path")
	      	.data(countries.features)
	      .enter().append("path") // add a path for each country
	      	.attr("fill", function(d) { 
	      		var country = countryByIso.get(d.id);
	      		if (typeof country !== 'undefined' && country.population1Jan) { // check that country is defined and the data is available
					return populationColor(country.population1Jan*1000); // map the data to the colour scale
	      		}
	      		return "#eee";
	      		
	      	})
	      	.attr("class",function(d) { return d.id + " country"}) // used to bind click events
	      	.attr("stroke",'#000')
	      	.attr("d", path);

	    // bind click events
	    d3.selectAll("path.country")
	    	.on("click",function(d) {
	    		
	    		var country = countryByIso.get(d.id); // use map function to retrieve country data by ISO
	    		var html;
	      		if (typeof country !== 'undefined') { // check we don't have missing data
					html = '<h2>' + country.country + '</h2>';
					html += '<h3>Births and Deaths</h3>';
					
					d3.select('#info')
		      			.html('')
		    			.append("div")
		    			.html(html);

              var data = [
                { label: "Deaths", value: country.deaths },
                { label: "Births", value: country.births }
            ];
            
            // Create groups for each data point (death and birth)
            var groups = svg.selectAll("g")
                .data(data)
                .enter()
                .append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * 38 + ")"; });
            
            // Add text for each data point
            groups.append("text")
                .attr("x", 5)
                .attr("y", 15)
                .attr("fill", "black")
                .text(function(d) { 
                    return d.label + ": " + d.value;
                });
				}
	    	});

	};

	map.init = function() {
		queue()
			.defer(d3.json, "data/world.topojson")
			/* Use a row walker function to set up a map of the data so it can be accessed by country iso code */
			.defer(d3.csv, "data/population2.csv",  function(d) { countryByIso.set(d.ISO3, d); return d; })
			.await(go);
	};	

}( window.map = window.map || {} ));

map.init();