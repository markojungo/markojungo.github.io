drawWindPressureHourlyPlot = function() {
    var margin = {top: 10, right: 30, bottom: 45, left: 60},
        width = 700 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;
    
    var xScaleWind = d3.scaleLinear().range([ 0, width ]);
    var yScaleWind = d3.scaleLinear().range([ height / 2, 0 ]);
    var xScalePressure = d3.scaleLinear().range([ 0, width ]);
    var yScalePressure = d3.scaleLinear().range([ height, height / 2]);

    var colorScale = d3.scaleOrdinal().range(['#262542','#81a193', '#b2d1c8']);

    var setupScales = function(data) {
        xScaleWind.domain(d3.extent(data, d => d.hour));
        yScaleWind.domain([0, d3.max(data, d => d.wind)]);
        xScalePressure.domain(d3.extent(data, d => d.hour));

        var pExt = d3.extent(data, d => d.pressure);
        yScalePressure.domain([pExt[0] - 5, pExt[1] + 20]);
    }

    var lineWind = d3.line()
                    .x(function(d) { return xScaleWind(d.hour) })
                    .y(function(d) { return yScaleWind(d.wind) });
    var linePressure = d3.line()
                    .x(function(d) { return xScalePressure(d.hour) })
                    .y(function(d) { return yScalePressure(d.pressure) });

    var xAxisWind = d3.axisBottom(xScaleWind);
    var xAxisPressure = d3.axisTop(xScalePressure);
    var yAxisWind = d3.axisLeft(yScaleWind);
    var yAxisPressure = d3.axisLeft(yScalePressure);

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
            
            var grouped = d3.group(data, d => d.minor_major);

            var svg = selection.append('svg')
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr('xmlns:xhtml', 'http://www.w3.org/1999/xhtml')
                        .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            grouped.forEach((v, k) => {
                svg.append('path')
                    .attr('class','line')
                    .style("stroke", d => { return colorScale(k) })
                    .style("stroke-width", 3)
                    .style("fill", 'none')
                    .attr("d", d => { return lineWind(v) })
                svg.append('path')
                    .attr('class','line')
                    .style("stroke", d => { return colorScale(k) })
                    .style("stroke-width", 3)
                    .style("fill", 'none')
                    .attr("d", d => { return linePressure(v) })
            })
            
            // Add Axes
            svg.append('g').attr('transform', 'translate('+[0, height / 2]+')').call(xAxisWind);
            svg.append('g').call(yAxisWind);
            svg.append('g').attr('transform', 'translate('+[0, height / 2]+')').call(xAxisPressure);
            svg.append('g').call(yAxisPressure);
            // Add Axes labels
            svg.append('text')
               .attr('class', 'x label')
               .attr('x', width / 2 - 15)
               .attr('y', height + 35)
               .text('Hours Since Start');
            svg.append('text')
               .attr('class', 'y label')
               .attr('x', -height / 4 - 25)
               .attr('y', -45)
               .attr('transform', 'rotate(-90)')
               .text('Wind Speed (mph)');
            svg.append('text')
               .attr('class', 'y label')
               .attr('x', -height * 3 / 4 - 25)
               .attr('y', -45)
               .attr('transform', 'rotate(-90)')
               .text('Pressure (millibars)');

            // Add legend
            svg.append('g').attr('transform', `translate(${width - 250}, 25)`).call(legend);

            // Add hovered tooltip
            var focus = svg.append('g').attr('class', 'focus').style('display', 'none');
            focus.append('circle')
                 .style('fill', '#857d87')
                 .style('stroke', '#857d87')
                 .attr('r', 4);
            focus.append('foreignObject')
                 .attr('class', "tip3outer")
                 .attr('width', 175)
                 .attr('height', 100)
                 .attr('x', 5)
                 .attr('y', -35)
                 .append('xhtml:body')
                 .attr("class", "tip3")
            svg.append('rect')
                .attr('width', width)
                .attr('height', height)
                .style('fill', 'none')
                .style('pointer-events', 'all')
                .on("mouseover", function() { focus.style("display", null); })
                .on("mouseout", function() { focus.style("display", "none"); })
                .on("mousemove", function(e, d) {
                    var closest;

                    if (e.layerY - 382 < height / 2) {
                        console.log(e.layerX, e.layerY, " First");
                        var x0wind = xScaleWind.invert(e.layerX - 333);
                        var y0wind = yScaleWind.invert(e.layerY - 384);
                        
                        var data = this.parentNode.__data__;
                        var closest = d3.scan(data, (a, b) => {
                            return Math.abs(a.hour - x0wind) - Math.abs(b.hour - x0wind) + Math.abs(a.wind - y0wind) - Math.abs(b.wind - y0wind)
                        });
                        
                        closest = data[closest];
                        
                        focus.attr('transform', 'translate('+xScaleWind(closest.hour)+','+yScaleWind(closest.wind)+')')
                    } else {
                        console.log(e.layerX, e.layerY);
                        var x0pressure = xScalePressure.invert(e.layerX - 333);
                        var y0pressure = yScalePressure.invert(e.layerY - 705 + 384);
                        
                        var data = this.parentNode.__data__;
                        var closest = d3.scan(data, (a, b) => {
                            return Math.abs(a.hour - x0pressure) - Math.abs(b.hour - x0pressure) + Math.abs(a.pressure - y0pressure) - Math.abs(b.pressure - y0pressure)
                        });
                        
                        closest = data[closest];

                        focus.transition()
                             .duration(10)
                             .attr('transform', 'translate('+xScalePressure(closest.hour)+','+yScalePressure(closest.pressure)+')')
                    }

                    d3.select('foreignObject.tip3outer')
                        .transition()
                        .duration(100)
                        .attr('x', () => {if (e.layerX > width - 100) { return -180 } else { return 5 }})

                    d3.select('body.tip3').html(() => {
                        return  `<div xmlns='http://www.w3.org/1999/xhtml' class='container p-1' style='color: ${closest.minor_major == 'major' ? 'white' : 'black'}'>
                                    <p class='lead' style='font-size: 14px; font-weight: bold; margin: 0'>
                                        ${closest.minor_major.charAt(0).toUpperCase() + closest.minor_major.slice(1)}
                                    </p>
                                    <p style='font-size: 11px; margin: 0'><b>Hour:</b> ${closest.hour}</p>
                                    <p style='font-size: 11px; margin: 0'><b>10H Avg Wind</b>: ${closest.wind.toFixed(2)} mph</p>
                                    <p style='font-size: 11px; margin: 0'><b>10H Avg Pressure</b>: ${closest.pressure.toFixed(2)} mbar</p>
                                </div>`
                    })
                    .transition()
                    .duration(10)
                    .style('background-color', colorScale(closest.minor_major))
                });
        })
    }

    return chart;
}