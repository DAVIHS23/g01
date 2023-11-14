d3.csv("data/population.csv").then(function(data) {
    // Convert numeric fields from strings to numbers
    data.forEach(d => {
        d.Region = d['Region, subregion, country or area *']; // Rename for convenience
        d.Population = +d['Total Population, as of 1 January (thousands)']; // Convert string to number
        d.Births = +d['Births (thousands)']; // Convert string to number
        d.Deaths = +d['Total Deaths (thousands)']; // Convert string to number
    });

    function createMap(data) {
        // Define the size of the map
        const width = 960;
        const height = 500;
    
        // Create a projection for the map
        const projection = d3.geoMercator()
            .scale(130)
            .translate([width / 2, height / 1.5]);
    
        // Create a path generator based on the projection
        const path = d3.geoPath().projection(projection);
    
        // Create an SVG element in the body of the page and set its size
        const svg = d3.select("#map").append("svg")
            .attr("width", width)
            .attr("height", height);
    
        // Load the GeoJSON data for the world map
        d3.json("world.geojson").then(function(geojson) {
            // Bind the GeoJSON data to the SVG and create one path per GeoJSON feature
            svg.selectAll("path")
                .data(geojson.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", "#ccc") // Default fill, you may want to change this based on your data
                .attr("stroke", "#333")
                .attr("stroke-width", 0.5);
    
            // If you want to color the countries based on some demographic variable like population,
            // you would need to join your CSV data with the GeoJSON data and then set the fill
            // color based on that variable.
            // Here's an example of how you might join the data and set the fill color:
            
            // Create a map of country names to population
            const populationByCountry = {};
            data.forEach(d => {
                populationByCountry[d.Region] = +d.Population; // Ensure Population is a number
            });
    
            // Function to set the color based on the population
            function getColor(d) {
                return d > 1000000 ? "#800026" :
                       d > 500000  ? "#BD0026" :
                       d > 200000  ? "#E31A1C" :
                       d > 100000  ? "#FC4E2A" :
                       d > 50000   ? "#FD8D3C" :
                       d > 20000   ? "#FEB24C" :
                       d > 10000   ? "#FED976" :
                                      "#FFEDA0"; // You will need a more refined scale based on your data
            }
    
            // Set the color of each country based on its population
            svg.selectAll("path")
                .attr("fill", function(d) {
                    // Use the country name from the GeoJSON data to get the population from the map
                    const population = populationByCountry[d.properties.name];
                    return population ? getColor(population) : "#ccc"; // Fallback color if no data available
                });
        });
    }

    
});
