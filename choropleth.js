function ChoroplethMap(target, jsonData) {
      this.target = d3.select(target);
      this.jsonData = jsonData;

      var width = 950,        // dimensions of the svg
          height = 500;      

      // add the svg element
      this.svg = this.target.append("svg")
          .attr("width", width)
          .attr("height", height);

      var projection = d3.geoAlbers()
          .scale(5000)
          .rotate([103, 0]);
      
      this.path = d3.geoPath().projection(projection)

      this.color = d3.scaleThreshold()
          .domain([50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000])
          .range(d3.schemeOrRd[9]);

      this.tip = this.target.append("div")
          .attr("class", "tip")
          .style("opacity", 0);

      this.target.on("mousemove", this.onMouseMove.bind(this));
      d3.json(this.jsonData, this.onJsonLoad.bind(this));
}

ChoroplethMap.prototype.onJsonLoad = function(err, topoData) {
    if (err) 
        return console.error(error);
    console.log(topoData.objects['colorado-counties']); //FIXME
    this.svg.selectAll("path")
        .data(topojson.feature(topoData, topoData.objects['colorado-counties']).features)
        .enter().append("path")
            .attr("fill", (d) => { return this.color(d.properties.VALUE); })
            .attr("d", this.path)
            .attr("shape-rendering", "optimizeQuality")
            .on("mouseover", (d) => {
                this.tip.style("opacity", .9);
                this.tip.html("County: " + d.properties.NAME + "<br> Median Price: " + this.formatCurrency(d.properties.VALUE));
            })
            .on("mouseout", () => {
                this.tip.style("opacity", 0);
            });

}

ChoroplethMap.prototype.onMouseMove = function() {
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

