drawFreqPlot = function() {
    var margin = {top: 10, right: 30, bottom: 45, left: 60},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    
    // Create X and Y scales
    var xScale = d3.scaleLinear().range([ 0, width ]);
    var yScale = d3.scaleLinear().range([ height, 0 ]);
    var colorScale = d3.scaleOrdinal().range(['#423f61','#81a193', '#b2d1c8']);
    
    var line = d3.line()
                 .x(function(d) { return xScale(d.year) })
                 .y(function(d) { return yScale(d.count) });

    var setupScales = function(data) {
        xScale.domain(d3.extent(data, d => d.year));
        yScale.domain([0, d3.max(data, d => d.count)]);
    }

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
                    .shape('circle');
                    
    chart = function(selection) {
        selection.each(function(data) {
            setupScales(data);

            var grouped = d3.group(data, d => d.minor_major);
            
            var svg = selection.append('svg')
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr('xmlns:xhtml', 'http://www.w3.org/1999/xhtml')
                        .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

            // Add line for each group
            grouped.forEach((v, k) => {
                svg.append('path')
                    .attr('class','line')
                    .style("stroke", d => { return colorScale(k) })
                    .style("stroke-width", 3)
                    .style("fill", 'none')
                    .attr("d", d => { return line(v) })
            })
            
            // Add hovered tooltip
            var focus = svg.append('g').attr('class', 'focus').style('display', 'none');
            focus.append('circle')
                 .style('fill', '#857d87')
                 .style('stroke', '#857d87')
                 .attr('r', 4);
            focus.append('foreignObject')
                .attr('id', 'outerTip1')
                //  .attr('xmlns', "http://www.w3.org/1999/xhtml")
                 .attr('width', 100)
                 .attr('height', 75)
                 .attr('x', 5)
                 .attr('y', -35)
                 .append('xhtml:body')
                 .attr("id", "tip1")
            svg.append('rect')
                .attr('width', width)
                .attr('height', height)
                .style('fill', 'none')
                .style('pointer-events', 'all')
                .on("mouseover", function() { focus.style("display", null); })
                .on("mouseout", function() { focus.style("display", "none"); })
                .on("mousemove", function(e, d) {
                    var x0 = xScale.invert(e.layerX - 345);
                    var y0 = yScale.invert(e.layerY - 400);
                   
                    var data = this.parentNode.__data__;
                    var closest = d3.scan(data, (a, b) => {
                        return Math.abs(a.year - x0) - Math.abs(b.year - x0) + Math.abs(a.count - y0) - Math.abs(b.count - y0)
                    });
                    var closest = data[closest];

                    focus.transition()
                         .duration(10)
                         .attr('transform', 'translate('+xScale(closest.year)+','+yScale(closest.count)+')')

                    d3.select('foreignObject#outerTip1')
                        .transition()
                        .duration(100)
                        .attr('x', () => {if (e.layerX > width) { return -105 } else { return 5 }})
                        .attr('y', () => {if (yScale(closest.count) < margin.top * 2) { return 0 } else { return -35 }})

                    d3.select('body#tip1').html(() => {
                        return  `<div xmlns='http://www.w3.org/1999/xhtml' class='container p-1' style='color: ${closest.minor_major == 'major' ? 'white' : 'black'}'>
                                    <p class='lead' style='font-size: 14px; font-weight: bold; margin: 0'>
                                        ${closest.minor_major.charAt(0).toUpperCase() + closest.minor_major.slice(1)}
                                    </p>
                                    <p style='font-size: 11px; margin: 0'><b>Year:</b> ${closest.year}</p>
                                    <p style='font-size: 11px; margin: 0'><b>10Y Avg</b>: ${closest.count.toFixed(2)}</p>
                                </div>`
                    })
                    .transition()
                    .duration(10)
                    .style('background-color', colorScale(closest.minor_major))
                }); 
            
            // Add Axes
            svg.append('g').attr('transform', 'translate('+[0, height]+')').call(xAxis);
            svg.append('g').call(yAxis);
            // Add Axes labels
            svg.append('text')
               .attr('class', 'x label')
               .attr('x', width / 2 - 15)
               .attr('y', height + 35)
               .text('Year');
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
};