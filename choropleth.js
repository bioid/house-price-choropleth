function ChoroplethMap(opts) {
    this.target = d3.select(opts.target); // the div we are going to add the map to
    this.jsonData = opts.jsonData;        // the address of the json file with map data
    this.state = opts.state;              // name of the state
    var width = 950,        // dimensions of the svg
        height = 500;      

    // add the svg element
    this.svg = this.target.append("svg")
        .attr("width", width)
        .attr("height", height);
    // create an albers projection
    // this must be rotated properly to center on the state
    var projection = d3.geoAlbers()
        .scale(opts.scale)
        .rotate(opts.rotate);
    
    this.path = d3.geoPath().projection(projection)

    // color scale for the counties
    this.color = d3.scaleThreshold()
        .domain([50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000])
        .range(d3.schemeOrRd[9]);
  
    // create a div for the tooltip
    this.tip = this.target.append("div")
        .attr("class", "tip")
        .style("opacity", 0);

    this.target.on("mousemove", this.onMouseMove.bind(this));
    d3.json(this.jsonData, this.onJsonLoad.bind(this));
}

ChoroplethMap.prototype.onJsonLoad = function(err, topoData) {
    if (err) 
        return console.error(error);
    this.svg.selectAll("path")
        .data(topojson.feature(topoData, topoData.objects[this.state + '-counties']).features)
        .enter().append("path")  //add paths for the features
            .attr("fill", (d) => { return this.color(d.properties.VALUE); }) // set the color based on the value
            .attr("d", this.path)
            .attr("shape-rendering", "optimizeQuality")
            .on("mouseover", (d) => {
                // set the tool tip text to display the name and median value
                this.tip.style("opacity", .9);
                this.tip.html("County: " + d.properties.NAME + "<br> Median Price: " + this.formatCurrency(d.properties.VALUE));
            })
            .on("mouseout", () => {
                // hide the tool tip text
                this.tip.style("opacity", 0);
            });

}

ChoroplethMap.prototype.onMouseMove = function() {
    // reposition the tooltip on mousemove
    var mouse = d3.mouse(document.body);
    this.tip.style("left", (mouse[0] + 20) + "px")
        .style("top", (mouse[1] - 28) + "px"); 

}

ChoroplethMap.prototype.formatCurrency = function(amount) {
    // TODO: support for browsers that don't support Intl
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
        }).format(amount);
}

