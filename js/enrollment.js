//http://bl.ocks.org/dbuezas/9306799

var padding = 10;

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.population; });

//rangeslider
$slider = $('#range').rangeslider();

function buildChart(data, radius, makeLegend) {

	var arc = d3.svg.arc()
    	.outerRadius(radius)
	    .innerRadius(radius / 2);

	if (makeLegend) {

		var legend = d3.select("#chart").append("svg")
			.attr("class", "legend")
			.attr("width", radius * 2)
			.attr("height", radius * 2)
			.selectAll("g")
			.data(color.domain().slice().reverse())
			.enter().append("g")
			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

		legend.append("text")
			.attr("x", 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.text(function(d) { return d; });
	}

	var svg = d3.select("#chart").append("svg")
		.datum(data)
		.attr("class", "pie")
		.attr("width", 400)
		.attr("height", 500)
		.append("g")
		.attr("transform", "translate(200,250)");

	var path = svg.selectAll(".arc")
		.data(function(d) {return pie(d.demographics); })
		.enter().append("path")
		.attr("class", "arc")
		.attr("d", arc)
		.each(function(d) { this._current = d; }) // store the initial angles 
		.style("fill", function(d) { return color(d.data.name); });

	var year = svg.append("text")
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.text(function(d) { return d.Year; });

	return {
		update: function(data, newRadius) {
			svg.datum([data]);
			path = path.data(function(d) {console.log(d); return pie(d[0].demographics); });
			path.transition().duration(750).attrTween("d", function(a) {
				var i = d3.interpolate(this._current, a),
					k = d3.interpolate(arc.outerRadius()(), newRadius);
				this._current = i(0);
				return function(t) {
					return arc.innerRadius(k(t)/2).outerRadius(k(t))(i(t));
				};
			});
			year.datum(data).text(function(d) {return d.Year});
		}
	};
}

var enrolled, completed;

function buildData(data) {
	color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Year" && key !== "Total"; }));
	$slider.attr('max', (data.length - 1));
	data.forEach(function(d) {
		var subTotal = 0;
		d.total = +d.Total.replace(/,/g, "");
		d.demographics = color.domain().map(function(name) {
			var population = +d[name].replace(/,/g, "");
			subTotal = subTotal + population;
		return {name: name, population: population};
		});
		d.demographics.push({
			name: "Other",
			population: d.total - subTotal
		});
	});
}

var chart = {};

chart.getRadius = function(total, base, completed) {
	var radius = 250;
		base = base || 10000000;
	return (total / base ) * radius;
};

d3.csv("../data/enrollment.csv", function(error, data) {
	if (error) throw error;
	buildData(data);
	chart.enrollmentData = data;
	var enrolledRad = chart.getRadius(chart.enrollmentData[0].total);
	chart.enrolled = buildChart(data[0], enrolledRad, true);

	// TODO Make this a promise
	d3.csv("../data/completed.csv", function(error, data) {
		if (error) throw error;
		buildData(data);
		chart.completionData = data;
		var completedRad = chart.getRadius(chart.completionData[0].total, chart.enrollmentData[0].total/* / 2*/);
		chart.completed = buildChart(data[0], completedRad);
	});
});


function update() {

	var enrolledRad = chart.getRadius(chart.enrollmentData[this.value].total),
		completedRad = chart.getRadius(chart.completionData[this.value].total, chart.enrollmentData[this.value].total /*/ 2*/);

	chart.enrolled.update(chart.enrollmentData[this.value], enrolledRad);
	chart.completed.update(chart.completionData[this.value], completedRad);

}

d3.select("#range").on("change", update);
d3.select("#range").on("input", update);

