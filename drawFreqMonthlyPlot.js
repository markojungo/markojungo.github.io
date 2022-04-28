drawFreqMonthlyPlot = function() {
    var margin = {top: 10, right: 30, bottom: 45, left: 60},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    
    var xScale = d3.scaleLinear().range([ 0, width ]);
    var yScale = d3.scaleLinear().range([ height, 0 ]);
    var colorScale = d3.scaleOrdinal().range(['#262542','#81a193', '#b2d1c8']);
    var setupScales = function(data) {
        xScale.domain(d3.extent(data, d => d.month));
        yScale.domain([0, d3.max(data, d => d.major + d.minor + d.none)]);
    }

    var stackGen = d3.stack().keys(['major', 'minor', 'none'])
                             .value((d, k) => {return d[k]})
    var areaGen = d3.area()
                    .x((d) => xScale(d.data.month))
                    .y0((d) => yScale(d[0]))
                    .y1((d) => yScale(d[1]));

    var xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    var yAxis = d3.axisLeft(yScale);
    var legend = d3.legendColor()
                    .scale(colorScale)
                    .labels(d => {
                        text = d.generatedLabels[d.i];
                        if (text == 'major') { return 'Major (Category 4-5)' }
                        else if (text == 'minor') { return 'Minor (Category 1-3)' }
                        else { return 'None (Tropical Depression or Storm)' }
                    })
                    .shape('circle')
                    .shapePadding(24)
                    .labelOffset(20);

    chart = function(selection) {
        selection.each(function(data) {
            setupScales(data);
            
            var stackedSeries = stackGen(data);

            var svg = selection.append('svg')
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr('xmlns:xhtml', 'http://www.w3.org/1999/xhtml')
                        .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            var areas = svg.selectAll('.area')
                           .data(stackedSeries)
                           .join('path')
                           .attr('class', 'area')
                           .attr('d', areaGen)
                           .style('fill', d => colorScale(d.key));
            
            // Add hovered tooltip
            var focus = svg.append('g').attr('class', 'focus').style('display', 'none');
            focus.append('circle')
                .style('fill', '#857d87')
                .style('stroke', '#857d87')
                .attr('r', 4);
            focus.append('foreignObject')
                .attr("id", "outerTip2")
                .attr('xmlns', "http://www.w3.org/1999/xhtml")
                .attr('width', 100)
                .attr('height', 75)
                .attr('x', 5)
                .attr('y', -35)
                .append('xhtml:body')
                .attr("id", "tip2")
            svg.append('rect')
                .attr('width', width)
                .attr('height', height)
                .style('fill', 'none')
                .style('pointer-events', 'all')
                .on("mouseover", function() { focus.style("display", null); })
                .on("mouseout", function() { focus.style("display", "none"); })
                .on("mousemove", function(e, d) {
                    var x0 = xScale.invert(e.layerX - margin.left);
                    var y0 = yScale.invert(e.layerY - margin.top);
                    
                    var data = this.parentNode.__data__;
                    var closest = d3.scan(data, (a, b) => {
                        return Math.abs(a.month - x0) - Math.abs(b.month - x0)
                    });
                    var closest = data[closest];
                    var closestX = closest.month;
                    var rels = [];
                    for (g of stackedSeries) {
                        row = g[closestX - 1];
                        rels.push(row);
                    }
                    var closestRow = rels[d3.scan(rels, (a, b) => {
                        return Math.abs(a[1] - y0) - Math.abs(b[1] - y0)
                    })];
                    var closestY = closestRow[1];
                    const {month, ...rest} = closestRow.data;
                    var minorMajor = Object.keys(rest).find(key => {
                        return Math.abs(rest[key] - (closestY - closestRow[0])) < 0.1;
                    });

                    focus.transition()
                        .duration(100)
                        .attr('transform', 'translate('+xScale(closestX)+','+yScale(closestY)+')')

                    d3.select('foreignObject#outerTip2')
                        .transition()
                        .duration(150)
                        .attr('x', () => {if (e.layerX > width) { return -105 } else { return 5 }})
                        .attr('y', () => {if (yScale(closestY) < margin.top * 2) { return 0 } else { return -35 }})

                    d3.select('body#tip2').html(() => {
                        return  `<div xmlns='http://www.w3.org/1999/xhtml' class='container p-1' style='color: ${minorMajor == 'major' ? 'white' : 'black'}'>
                                    <p class='lead' style='font-size: 14px; font-weight: bold; margin: 0;'>
                                        ${minorMajor.charAt(0).toUpperCase() + minorMajor.slice(1)}
                                    </p>
                                    <p style='font-size: 11px; margin: 0'><b>Month:</b> ${toMonthName(closestX)}</p>
                                    <p style='font-size: 11px; margin: 0'><b>Average</b>: ${(closestY - closestRow[0]).toFixed(2)}</p>
                                </div>`
                    })
                    .transition()
                    .style('background-color', colorScale(minorMajor))
                }); 

            // Add Axes
            svg.append('g').attr('transform', 'translate('+[0, height]+')').call(xAxis);
            svg.append('g').call(yAxis);
            // Add Axes labels
            svg.append('text')
               .attr('class', 'x label')
               .attr('x', width / 2 - 15)
               .attr('y', height + 35)
               .text('Month');
            svg.append('text')
               .attr('class', 'y label')
               .attr('x', -height / 2 - 25)
               .attr('y', -25)
               .attr('transform', 'rotate(-90)')
               .text('Frequency');

            // Add legend
            svg.append('g').attr('transform', 'translate(25, 25)').call(legend);
        })
    }

    return chart;
}

function toMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
  
    return date.toLocaleString('en-US', {
      month: 'long',
    });
}