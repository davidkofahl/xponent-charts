console.log('chart init');

Chart.defaults.global.responsive = true;
Chart.defaults.global.hover.onHover = function(el) {
	if (el.length) {
		// console.log(el);
		
	}
};

//animation
Chart.defaults.global.animation.duration = 2000;
Chart.defaults.global.animation.easing = "easeOutQuart";
// Chart.defaults.global.animationEasing = 'easeOutBounce';

console.log(Chart.defaults.global);

//Tooltops
Chart.defaults.global.tooltips.yPadding = 10;
Chart.defaults.global.tooltips.cornerRadius = 0;
Chart.defaults.global.tooltips.titleFontStyle = 'normal';
Chart.defaults.global.tooltips.fillColor = 'rgba(0,160,0,0.8)';


Chart.defaults.global.scaleLineColor = 'black';
Chart.defaults.global.scaleFontSize = 100;


//////.getDatasetAtEvent(e)




var ctx = document.getElementById('canvas').getContext('2d');
var chart;

$.ajax({
	url: "//127.0.0.1:8080/income.json",
	success: function(data) {

		chart = createChart(ctx, {
			type: "line",
			data: formatData(data),
			options: {
				tooltips: {
					enabled: false	
				},
				scales: {
					xAxes: [{
						afterBuildTicks: function() {
							console.log('after build ticks');
							console.log(arguments);
						},
						ticks: {
							// Return an empty string to draw the tick line but hide the tick label
							// Return `null` or `undefined` to hide the tick line entirely
							userCallback: function(value, index, values) {
								return value;
							}
						}
					}]
				}
			}
		});

		$('canvas').on('click', function(evt) {
			var elements = chart.getElementsAtEvent(evt);

			// var set = chart.getDatasetAtEvent(evt);
// 
// 			console.log('set');
// 			console.log(chart.getDatasetAtEvent);
// 			console.log(set);
// 

			function getMean(elements) {
				
				var x = 0,
					y = 0;

				_.each(elements, function(el) {
					x += el._model.x;	
					y += el._model.y;	
				});

				var mean = {
					x: (x / elements.length),
					y: (y / elements.length)
				};

				return mean;
			}

			function filterElements(elements, thread) {
			
				return _.filter(elements, function(el) {
					var label = data.datasets[el._datasetIndex].label;
					return _.contains(thread, label);
				});

			}

			function buildTooltip(position, text) {
	
				var $tooltip = $('#diff-tooltip');

				if (!$tooltip[0]) {
					$('body').append('<div id="diff-tooltip"></div>');
					$tooltip = $('#diff-tooltip');
				}

				// // Hide if no tooltip
				// if (!tooltip.opacity) {
				// 	tooltipEl.css({
				// 	opacity: 0
				// 	});
				// 	$('.chartjs-wrap canvas')
				// 	.each(function(index, el) {
				// 		$(el).css('cursor', 'default');
				// 	});
				// 	return;
				// }

				// $(this._chart.canvas).css('cursor', 'pointer');

				// Set caret Position
				$tooltip.removeClass('above below no-transform');
				// if (tooltip.yAlign) {
				// 	tooltipEl.addClass(tooltip.yAlign);
				// } else {
				// 	tooltipEl.addClass('no-transform');
				// }

				$tooltip.html(text);

				// Find Y Location on page
				// var top = 0;
				// if (tooltip.yAlign) {
				// 	if (tooltip.yAlign == 'above') {
				// 	top = tooltip.y - tooltip.caretHeight - tooltip.caretPadding;
				// 	} else {
				// 	top = tooltip.y + tooltip.caretHeight + tooltip.caretPadding;
				// 	}
				// }

				console.log("chart");
				console.log(chart);
				var canvas = chart.chart.canvas.getBoundingClientRect();

				// Display, position, and set styles for font
				$tooltip.css({
					position: "absolute",
					opacity: 1,
					// width: tooltip.width ? (tooltip.width + 'px') : 'auto',
					left: canvas.left + position.x + 'px',
					top: canvas.top + position.y + 'px',
					// fontFamily: tooltip._fontFamily,
					// fontSize: tooltip.fontSize,
					// fontStyle: tooltip._fontStyle,
					// padding: tooltip.yPadding + 'px ' + tooltip.xPadding + 'px',
				});


			}

			if (elements.length) {

				var data = chart.config.data,
					idx = elements[0]._index,
					diff = data.differences.data[idx],
					position = {};

				elements = filterElements(elements, ['Low', 'High']);
				position = getMean(elements);

				console.log('element chart');
				console.log(elements[0]._chart.canvas);
				console.log(elements[0]._chart.canvas.getBoundingClientRect());
				buildTooltip(position, diff);

			}
		
		});

		console.log(chart.helpers);

	}
});

function formatData(data) {

	var labels = [],
		average = {
			label: "Average",
			data: [],
			hidden: true
		},
		low = {
			label: "Low",
			data: []
		},
		high = {
			label: "High",
			data: []
		},
		difference = {
			data: []
		};

		
	_.each(data, function(obj) {
		labels.push(obj.year);
		average.data.push(obj.average);
		low.data.push(obj.low);
		high.data.push(obj.high);
		difference.data.push(obj.difference);
	});

	return {
		labels: labels,
		datasets: [average, low, high],
		differences: difference,
		hover: {
			onHover: function(evt) {
				console.log('hover');
			}
		}
	};
}

function createChart(ctx, chart) {
	return new Chart(ctx, chart);
}
