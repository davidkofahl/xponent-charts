var margin = {top: 100, right: 100, bottom: 200, left: 100},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
	// .innerTickSize(-width)
    // .outerTickSize(0)
    // .tickPadding(10);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("#chart").append("svg")
    .attr("width", "100%")
    .attr("height", height + margin.top + margin.bottom)
	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var line = function(field) {
	return d3.svg.line()
        .x(function(d) {return x(d.date);})
        .y(function(d) {
            return y(d[field] || 0);
    }).interpolate("basis");
};

var area = function(field) {
    return d3.svg.area()
        .x(function(d) {return x(d.date);})
        .y0(height)
        .y1(function(d) {
            return y(d[field] || 0);
        }).interpolate("basis");
};


// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);


d3.csv("../data/income.csv", function(error, data) {

	if (error) throw error;

	data.forEach(function(d) {
		d.date		 = new Date(d.year);
		d.high		 = +d.high;
		d.low		 = +d.low;
		d.average	 = +d.average;
		d.difference = {
			percentage: d.difference,
			point: (d.high + d.low) / 2
		};
	});

	x.domain(d3.extent(data, function(d) { return d.date; }));
	y.domain([0, d3.max(data, function(d) { return d.high; })]);

	svg.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return x(d.date); })
		.attr("width", 1)
		.attr("y", "0")
		.attr("height", height);

	var highPath = svg.append("path")
		.datum(data)
		.attr("class", "high")
		.attr("d", area());

	var averagePath = svg.append("path")
		.datum(data)
		.attr("class", "average")
		.attr("d", line());

	var lowPath = svg.append("path")
		.datum(data)
		.attr("class", "low")
		.attr("d", area());

	// var diffs = svgappend("g")
	//	.attr("class", "x axis")
	//	.attr("transform", "translate(0," + height + ")")
	//	.call();
	
	var diffs = svg.selectAll("g")
		.data(data)
		.enter().append("g")
		.attr("transform", function(d, i) { return "translate(" + x(d.date) + "," + y(d.difference.point) + ")";})
		.style("opacity", 0)
		
	// diffs.append("text")
	// 	.text(function(d) {
	// 		return "Year: " + d.date;
	// 	});

	diffs.append("text")
		.text(function(d) {
			return d.year + ": " + d.difference.percentage;
		});

	// var highDot = svg.selectAll("high-dot")
	//	.data(data.filter(function(d) { return d; }))
	//	.enter().append("circle")
	//	.attr("class", "high-dot")
	//	.attr("cx", area("high").x())
	//	.attr("cy", area("high").y())
	//	.attr("r", 2);

	// var lowDot = svg.selectAll("low-dot")
	//	.data(data.filter(function(d) { return d; }))
	//	.enter().append("circle")
	//	.attr("class", "low-dot")
	//	.attr("cx", area(data, 'low').x())
	//	.attr("cy", area(data, 'low').y())
	//	.attr("r", 2);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0,210)")
		.call(xAxis);

	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(-10, 0)")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Percentage");
	
	var hovers = svg.selectAll(".hovers")
		.data(data)
		.enter().append("rect")
		.attr("class", "hovers")
		.attr("x", function(d) { return x(d.date); })
		.attr("width", 6)
		.attr("y", "0")
		.attr("height", height)
		.attr("transform", "translate(-3,0)");

	lowPath.datum(data).transition().duration(500).attr("d", area('low'));      
	highPath.datum(data).transition().duration(500).attr("d", area('high'));      

	d3.select("#average").on("click", function(){

		var $this = d3.select(this);

		if ($this.classed("showing")) {
			$this.classed("showing", false);
			averagePath.datum(data).transition().duration(500).attr("d", line());      
		} else {
			$this.classed("showing", true);
			averagePath.datum(data).transition().duration(500).attr("d", line("average"));      
		}
	});

	hovers.on('mouseover', function(data, idx) {
		diffs.select(function(d, i) {
			return i === idx ? this : null;
		}).style("opacity", 1);
	}).on('mouseout', function() {
		diffs.style("opacity", 0);
	});

});
 
