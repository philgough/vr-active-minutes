var Data

window.onload = function() {

	var svgDims = {width: 1040, height: 500};
	var svgMargin = {top: 20, bottom:60, left:50, right:10};
	svgMargin.vertical = svgMargin.top + svgMargin.bottom;
	svgMargin.horizontal = svgMargin.left + svgMargin.right;
	svgDims.innerHeight = svgDims.height - svgMargin.vertical;
	svgDims.innerWidth = svgDims.width - svgMargin.horizontal;
	var svg;

	d3.csv("data.csv")
	  	.then(function(data) {
			svg = d3.select("#chart")
			svg.attr("width", svgDims.width + svgMargin.horizontal)
				.attr("height", svgDims.height + svgMargin.vertical).style("border", "1px solid #001f3f");

			// console.log(data);

			// external data for testing
			Data = data;
			barData = [];
			multiGameData = [];
			legendData = [];
			// grab the bar svg data - since it's only a few of the sample data points
			data.forEach(function(d) {
				if (d.VR_HR_Values.length > 0) {
					barData.push(d);

					if (!legendData.includes(d.VR_Game) && d.VR_Game.split("/").length == 1) {
						console.log("legend:", d.VR_Game)
						legendData.push(d.VR_Game)
					}
				}
				// if it's got 2 games, add it to the multiGameData
				if (d.VR_HR_Values.length > 0 && d.VR_Ratio != 1) {
					// console.log("Games:", d.VR_Game.split('/'));
					temp = d.VR_Game.split('/');
					temp_HR = d.VR_HR_Values.split(",");
					// console.log("temp_HR:", temp_HR);

					for (var i = 0; i < temp.length; i++) {
						var obj = { VR_Game: temp[i],
									Date: d.Date,
									VR_AM: d.VR_AM,
									Steps_AM: d.Steps_AM,
									"Total Steps":d['Total Steps'],
									Total_AM: d.Total_AM,
									VR_Ratio: d.VR_Ratio.split(":")[i],
									Sequence: i,
									Max_Sequence: temp.length
								};

						output = []

						while (output.length < (d.VR_HR_Values.split(",").length * (+d.VR_Ratio.split(":")[i]))) {
							// console.log(output.length)
							output.push(temp_HR.splice(0, 1)[0]);
						}
						// console.log("output:", output);
					if (!legendData.includes(temp[i])) {
						// console.log("legend:", d.VR_Game)
						legendData.push(temp[i])
					}
						obj.VR_HR_Values = output;
						multiGameData.push(obj)
					}
				}
			})
			console.log(legendData);
			console.log("multi-game data:",multiGameData);
			// create the chart
			x = d3.scaleBand().rangeRound([svgMargin.left, svgDims.width]).padding(0.1),
	 		y = d3.scaleLinear().rangeRound([svgDims.innerHeight, 0]);


	 		// x-axis based on date
			x.domain(data.map(function(d) { return d.Date; }));
			// y-axis based on Total active minutes
			y.domain([0, d3.max(data, function(d) { return +d.Total_AM; })]);
			// console.log(x, y);
			drawArea = svg.append("g")
				.attr("transform", "translate("+ -svgMargin.left+", "+svgMargin.top+")")
				.attr("height", svgDims.height - svgMargin.vertical)
				.attr("width", svgDims.width - svgMargin.horizontal)
				.attr("class", "draw-area")

			svg.append("g")
				.attr("class", "axis x-axis")
				.attr("transform", "translate(0, "+ (svgDims.innerHeight + svgMargin.top) + ")")
				.call(d3.axisBottom(x))
				// .text("hello")

				.selectAll("text")
					.attr("x", 9)
					.attr("y", -x.bandwidth()/3)
					.attr("transform", "rotate(90)")
					// .attr("test", function(d) {console.log(d3.timeDay(d))})
					.style("text-anchor", "start");

			svg.append("g")
				.attr("class", "axis y-axis")
				.attr("transform", "translate("+svgMargin.left + "," + svgMargin.top + ")")				
				.call(d3.axisLeft(y))//.ticks(10, "Active_Minutes"))

			// add a legend
			legend = svg.append("g")
				.attr("class", "legend")
				.attr("transform", "translate(" + (+svgDims.width - svgMargin.right) +", 10)");
			legend.selectAll("rect")
				.data(legendData)
				.enter().append("rect")
				.attr("class", function (d) {return "legend-item " + d;})
				.attr("width", 10)
				.attr("height", 10)
				.attr("x", 0)
				.attr("y", function(d, i) {return i * 15;})
				.on("mouseover", function(d) {

					mouseOverLegend(d);
				})
				.on("mouseout", function() {mouseOut()});


			legend.selectAll("text")
				.data(legendData)
				.enter().append("text")
				.attr("class", function(d) {return d + " legend-text legend-item";})
				.attr("x", 12)
				.attr("y", function(d, i) {return i * 15 + 9;})
				.text(function(d) {return d;})
				.attr("fill", "black")
				.attr("stroke", "none");



			// d3.select(".legend").append("rect").attr("width",10).attr("height",10).attr("x",10).attr("y", 10);

			// bars for specific vr values
			var vrBars = drawArea.append("g")
				.attr("class", "bar-chart")
				.attr("transform", "translate("+ svgMargin.left + ")")
				.attr("width", svgDims.width)
				.attr("height", svgDims.height);


			vrBars.selectAll(".bar")
				.data(barData)
				.enter().append("rect")
					.attr("class", function(d) {
						if (d.VR_Game.split("/").length > 1) {
							var cls = "multi-bar-bg bar "
							for (var i = 0; i < d.VR_Game.split("/").length; i++) {
								cls += d.VR_Game.split("/")[i];
							}
							return cls;
						}
						else {return "bar " + d.VR_Game}
					})
					.attr("x", function(d) {return x(d.Date)})
					.attr("y", function(d) {return y(+d.VR_AM)})
					.attr("width", x.bandwidth())
					.attr("height", function(d) {return svgDims.innerHeight - y(+d.VR_AM)})
					.on("mouseover", function(d) {
					// 	d3.selectAll(".bar").attr("opacity", 0.3);
					// 	d3.selectAll(".total-line").attr("opacity", 0.3);
					// 	d3.selectAll(".dot").attr("opacity", 0.3);
					// 	d3.selectAll(".legend-item").attr("opacity", 0.3);
					// 	if (d.VR_Game.split("/").length > 1) {
					// 		for (var i = 0; i < d.VR_Game.split("/").length; i++) {
					// 			d3.selectAll("."+d.VR_Game.split("/")[i]).attr("opacity", 1);
					// 		}
					// 		d3.selectAll("multi-bar").attr("opacity", 1);
					// 		d3.selectAll("multi-bar-bg").attr("opacity", 1);
					// 	}
					// 	else {
					// 		d3.selectAll("."+d.VR_Game).attr("opacity", 1);
					// 	}
					// 	d3.select("#total-am").text(d.Total_AM);
					// 	d3.select("#steps-am").text(d.Steps_AM);
					// 	d3.select("#vr-am").text(d.VR_AM)
					// 	d3.select("#steps-total").text(d['Total Steps'])
					// 	d3.selectAll(".tooltip").style("visibility", "visible");


					// })
						mouseOver(d.VR_Game.split("/"), d);
						sparkLine(d);
					})
					.on("mouseout", function() {mouseOut()})
					.on("mousemove", function() {mouseMove()});


			var mouseOver = function (games, d) {
				deminish();

				d3.select("#total-am").text(d.Total_AM);
				d3.select("#steps-am").text(d.Steps_AM);
				d3.select("#vr-am").text(d.VR_AM)
				d3.select("#steps-total").text(d['Total Steps'])
				d3.select("#date").text(d.Date);
				d3.select("#games").text(games);
				arr = d.VR_HR_Values.replace(/\s/g, '')
				array = d.VR_HR_Values.replace(/\s/g, '').split(',')
	        	arran = array.map(function(item) {
				    return parseInt(item, 10);
				});
				d3.select("#max-vr-hr").text(d3.max(arran))
				d3.selectAll(".tooltip").style("visibility", "visible");
				for (var i = 0; i < games.length; i++) {
					d3.selectAll("."+games[i]).attr("opacity", 1);
				}
			}

			var mouseOverLegend = function (game) {
				deminish();
				d3.selectAll("."+game).attr("opacity", 1);
			}

			var deminish = function () {
				d3.selectAll(".bar").attr("opacity", 0.3);
				d3.selectAll(".total-line").attr("opacity", 0.3);
				d3.selectAll(".dot").attr("opacity", 0.3);
				d3.selectAll(".legend-item").attr("opacity", 0.3);
			}
			var tinyTooltip = function (d) {
				deminish();
				d3.select("#total-am").text(d.Total_AM);
				d3.select("#steps-am").text(d.Steps_AM);
				d3.select("#steps-total").text(d['Total Steps'])
				d3.select("#date").text(d.Date);
				d3.select("#vr-am").style("display", "none")
				d3.select("#max-vr-hr").style("display", "none")
				d3.select("#vr-hr-wrapper").style("display", "none")
				d3.selectAll(".tooltip").style("visibility", "visible");
			}

			var mouseOut = function() {
				// console.log("mouseing out");
				d3.selectAll(".bar").attr("opacity", 1);
				d3.selectAll(".dot").attr("opacity", 1);
				d3.selectAll(".legend-item").attr("opacity", 1);
				d3.selectAll(".total-line").attr("opacity", 1);
				d3.select("#vr-am").style("display", "inline")
				d3.select("#max-vr-hr").style("display", "inline")
				d3.select("#vr-hr-wrapper").style("display", "inline")

				d3.selectAll(".tooltip").style("visibility", "hidden");
			}

			var mouseMove = function() {
				d3.select(".tooltip")
					.style("left", function() {return d3.min([(svgDims.width - 220), (d3.event.pageX + 10)]) + "px"})
	                .style("top", (d3.event.pageY + 28) + "px");			
            }


            d3.select('#vr-hr-wrapper').append("svg")
            	.attr("id", "vr-hr")
            	.attr("width", "200")
            	.attr("height", "35")


            sx = d3.scaleLinear().range([0, 180]);	
	 		sy = d3.scaleLinear().range([30, 10]);
	 		// sx.domain([0, 10]);
			// sy.domain([0, 10]);

			sparkline = d3.line() 
				.x(function(d, i) { //console.log(i) ///console.log("sparkline.x"); 
					return sx(i); })
				.y(function(d) { //console.log("sparkline.y returns:", sy([d.VR_HR_Values]), d); 
					return sy(d); });

            spark = d3.select("#vr-hr")
            	.append("g")
            	.attr("width", 230)
            	.attr("height", 25);
            
            spark.append("path");
            spark.append("circle")
            	.attr("fill", "#FF4136")
            	.attr("r", 1.2)
            spark.append("text").text("")

            sparkLine = function(datum) {
            	array = datum.VR_HR_Values.replace(/\s/g, '').split(',')
            	var arran = array.map(function(item) {
				    return parseInt(item, 10);
				});
            	sx.domain([0, arran.length])
            	sy.domain([d3.min(arran), d3.max(arran)])
            	sparkline = d3.line() 
				.x(function(d, i) { 
					return sx(i); })
				.y(function(d) { 
					return sy(d); });
            	spark.selectAll("path")
            		.datum(arran)
            		.attr("fill", "none")
            		.attr("stroke", "#000")
            		.attr("stroke-width", 0.5)
            		// .attr("transform", "translate(10, 20)")
					.attr("d", sparkline);
				spark.select("circle")
					.attr("cx", sx.range()[1])
					.attr("cy", sy(arran[arran.length-1]))

				spark.select("text")
					.attr("y", sy(arran[arran.length-1]) + 3)
					.attr("x", sx.range()[1] + 4)
					.text(arran[arran.length-1])
            }



			vrBars.selectAll(".multi-bar")
				.data(multiGameData)
				.enter().append("rect")
					.attr("class", function(d) {return "multi-bar bar " + d.VR_Game})
					.attr("x", function(d) {return x(d.Date) + (x.bandwidth() * d.Sequence/d.Max_Sequence)})
					.attr("y", function(d) {return y(+d.VR_AM*d.VR_Ratio)})
					.attr("width", function(d) {return x.bandwidth()/d.Max_Sequence})
					.attr("height", function(d) {return svgDims.innerHeight - y(+d.VR_AM*d.VR_Ratio)})
					.on("mouseover", function(d) {
						// console.log(d);	
						mouseOver(d.VR_Game.split("/"), d);

					})
					.on("mouseout",  function() {
						mouseOut();
					})
					.on("mousemove", function() {mouseMove()});

			// add a line for the recommended level of active minutes
			var recommendedLine = drawArea.append("g")
				.attr("class", "recommended-line")
				// .attr("transform", "translate("+ svgMargin.left + ")")


			recommendedLine.append("line")
				.attr("class", "dashed-line")
				.attr("y1", y(45))
				.attr("y2", y(45))
				.attr("x1", svgMargin.left + x(data[0].Date))
				.attr("x2", svgDims.width + svgMargin.left)



			// line chart for active minutes
			var stepLine = drawArea.append("g"). attr("class", "step-line")
							.attr("transform", "translate("+ svgMargin.left + ")")



			var line = d3.line()
				.x(function(d) { return x(d.Date); })
				.y(function(d) { return y(d.Steps_AM); });

			stepLine.append("path")
				.datum(data)
				.attr("class", "step-path")
				.attr("fill", "none")
				.attr("transform", "translate("+ x.bandwidth()/2+", 0)")
				.attr("d", line)
					.on("mouseover", function(d) {
						deminish();
					})
					.on("mouseout",  function() {
						mouseOut();
					})
					.on("mousemove", function() {mouseMove()});


			var dotRadius = 1.75
			stepLine.selectAll("circle")
				.data(data)
				.enter().append("circle")
					.attr("class", function(d) {return "line-dot " + ("date_" + d.Date)})
					.attr("cx", function(d) {return x(d.Date) + x.bandwidth()/2})
					// .attr("y", function(d) {return y(+d.Total_AM)})
					.attr("cy", function(d) {return y(+d.Steps_AM)})
					.attr("r", dotRadius)
					.on("mouseover", function(d) {
						// d3.selectAll(".bar").attr("opacity", 0.3);
						// d3.selectAll(".total-line").attr("opacity", 0.3);
						// d3.selectAll(".dot").attr("opacity", 0.3);
						// d3.selectAll(".legend-item").attr("opacity", 0.3)
						// d3.selectAll("."+d.Date).attr("opacity", 1)
						// deminish();
						if (d.VR_Game.length > 0){
							mouseOver(d.VR_Game.split('/'), d);
						}
						else {
							tinyTooltip(d);
						}
						// mouseOver();
					})
					.on("mouseout",  function() {
						mouseOut();
					})
					.on("mousemove", function() {mouseMove()});


			// dots for total active minutes
			dotRadius = 3;
			vrBars.selectAll("line")
				.data(barData)
				.enter().append("line")
					.attr("class", function(d) {return "total-line " + d.VR_Game})
						.attr("x1", function(d) {return x(d.Date) + x.bandwidth()/2})
					.attr("x2", function(d) {return x(d.Date) + x.bandwidth()/2})
					.attr("y1", function(d) {return y(d.Total_AM)})
					.attr("y2", function(d) {return y(d.Steps_AM)});
					// .attr("height", 10);			vrBars.selectAll("circle")
			vrBars.selectAll("circle")
				.data(barData)
				.enter().append("circle")
					.attr("class", function(d) 						
						{
						if (d.VR_Game.split("/").length > 1) {
							var cls = "multi-bar-dot dot "
							for (var i = 0; i < d.VR_Game.split("/").length; i++) {
								cls += d.VR_Game.split("/")[i] + " ";
							}
							console.log(cls);
							return cls;
						}
						else {return "bar " + d.VR_Game}
					})
					.attr("cx", function(d) {return x(d.Date) + x.bandwidth()/2})
					// .attr("y", function(d) {return y(+d.Total_AM)})
					.attr("cy", function(d) {return y(+d.Total_AM)})
					.attr("r", dotRadius)
					.on("mouseover", function(d) {
						mouseOver(d.VR_Game.split("/"), d);
					})
					.on("mouseout",  function() {
						mouseOut();
					})
					.on("mousemove", function() {mouseMove()});


			d3.select("#load").remove();

		})
}
