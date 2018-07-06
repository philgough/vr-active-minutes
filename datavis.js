window.onload = function() {

	var chartDims = {width: 840, height: 500};
	var padding = {top: 10, bottom:10, left:10, right:10}

	d3.csv('data.csv')
	  .then(function(data) {
		d3.select('#chart').attr('width', chartDims.width).attr('height', chartDims.height).style('border', '1px solid darkblue');

		console.log(data);

		// draw the line chart
		

	  })



}
