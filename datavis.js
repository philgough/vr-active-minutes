var Data

window.onload = function() {

	var svgDims = {width: 840, height: 500};
	var svgMargin = {top: 10, bottom:30, left:0, right:10};
	svgMargin.vertical = svgMargin.top + svgMargin.bottom;
	svgMargin.horizontal = svgMargin.left + svgMargin.right;
	var svg;
	d3.csv("data.csv")
	  	.then(function(data) {
			svg = d3.select("#chart")
			svg.attr("width", svgDims.width + svgMargin.horizontal)
				.attr("height", svgDims.height + svgMargin.vertical).style("border", "1px solid darkblue");

			// console.log(data);

			// external data for testing
			Data = data;
			barData = [];
			// grab the bar svg data - since it's only a few of the sample data points
			data.forEach(function(d) {if (d.VR_HR_Values.length > 0) {barData.push(d);}})

			// create the chart
			var x = d3.scaleBand().rangeRound([0, svgDims.width]).padding(0.1),
	 		y = d3.scaleLinear().rangeRound([svgDims.height, 0]);


	 		// x-axis based on date
			x.domain(data.map(function(d) { return d.Date; }));
			// y-axis based on Total active minutes
			y.domain([0, d3.max(data, function(d) { return +d.Total_AM; })]);
			// console.log(x, y);

			svg.append("g")
				.attr("class", "axis x-axis")
				.attr("transform", "rotate(-90)")
				.attr("transform", "translate("+ svgMargin.left + ", "+ (svgDims.height) + ")")
				.call(d3.axisBottom(x));

			svg.append("g")
				.attr("class", "axis y-axis")
				.attr("transform", "translate("+svgMargin.left + ")")				
				.call(d3.axisLeft(y))//.ticks(10, "Active_Minutes"))


			// bars for specific vr values
			var vr_bars = svg.append("g")
				.attr("class", ".bar-chart")
				.attr("transform", "translate("+ svgMargin.left + ")")
				.attr("width", svgDims.width)
				.attr("height", svgDims.height);

			vr_bars.selectAll(".bar")
				.data(barData)
				.enter().append("rect")
					.attr("class", "bar")
					.attr("x", function(d) {return x(d.Date)})
					.attr("y", function(d) {return y(+d.VR_AM)})
					.attr("width", x.bandwidth())
					.attr("height", function(d) {return svgDims.height - y(+d.VR_AM)})

			
			// add a line for the 
			var recommended_line = svg.append("g")
				.attr("class", "recommended_line")
				.attr("transform", "translate("+ svgMargin.left + ")")


			recommended_line.append("line")
				.attr("class", "dashed-line")
				.attr("y1", y(45))
				.attr("y2", y(45))
				.attr("x1", svgMargin.left)
				.attr("x2", svgDims.width - svgMargin.horizontal)



			// line chart for active minutes
			var step_line = svg.append("g"). attr("class", "step_line")
							.attr("transform", "translate("+ svgMargin.left + ")")



			var line = d3.line()
				.x(function(d) { console.log(d); return x(d.Date); })
				.y(function(d) { return y(d.Steps_AM); });

			step_line.append("path")
				.datum(data)
				.attr("class", "step-path")
				.attr("fill", "none")
				// .attr("stroke", "red")
				// .attr("stroke-width", 1.5)
				.attr("d", line)



			var dotRadius = 3;
			// dots for total active minutes
			vr_bars.selectAll(".dot")
				.data(data)
				.enter().append("circle")
					.attr("class", "dot")
					.attr("cx", function(d) {return x(d.Date) + x.bandwidth()/2})
					// .attr("y", function(d) {return y(+d.Total_AM)})
					.attr("cy", function(d) {return y(+d.Total_AM) - dotRadius})
					.attr("r", dotRadius);
					// .attr("height", 10);
			

		})



}
