drawGeoPlot = function () {
    // Map stuff:
    var atlLatLng = new L.LatLng(27.9506, -72.4572); // center 10 degrees East of Tampa
    var myMap = L.map('map').setView(atlLatLng, 4);

    // Esri map tilelayer:
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 13,
        minZoom: 3,
        attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
    }).addTo(myMap);

    var svgLayer = L.svg();
    svgLayer.addTo(myMap);

    document.getElementById('tab4btn').onclick = function () {
        setTimeout(function () {
            window.dispatchEvent(new Event('resize'));
        }, 300);
    };


    chart = function (selection) {
        var svg = selection.select('#map').select('svg');
        var nodeLinkG = svg.select('g')
            .attr('class', 'leaflet-zoom-hide');

        selection.each(function (data) {
            // scale ordinal for names: -> could be categorical but whatever
            var nodeTypes = d3.map(data, function (d) { return d['name']; }).keys();
            var colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(nodeTypes);

            // scale for radius of circle based off of category type:
            var linkCountExtent = d3.map(data, function (d) { return +d['wind']; }).keys();
            var radiusScale = d3.scaleSqrt().range([0.1, 0.7]).domain(linkCountExtent);

            // challenge 1 tooltip:
            const Tooltip = d3.select('#map').append("div")
                                .attr("class", "tooltip")
                                .style("opacity", 1)
                                .style("background-color", "white")
                                .style("border", "solid")
                                .style("border-width", "2px")
                                .style("border-radius", "5px")
                                .style("padding", "5px")
            const mouseover = function(event, d) {
                Tooltip.style("opacity", 1)
            }
            var mousemove = function(event, d) {
                Tooltip
                    .html(
                        `<div class='container'>
                            <b>${d.nameyear}</b><br>
                            category: ${d.category}<br>
                            wind: ${d.wind} mph<br>
                            pressure: ${d.pressure} mph<br>
                            longitude: ${d.long}<br>
                            latitude: ${d.lat}
                        </div>`
                    )
                    .style("left", (event.x)/2 + "px")
                    .style("top", (event.y)/2 - 30 + "px")
            }
            var mouseleave = function(event, d) {
                Tooltip.style("opacity", 0)
            }

            // function to draw nodes:
            function readyToDraw(nodes) {
                nodeLinkG.selectAll('.grid-link')
                    .data(nodes)
                    .enter().append('line')
                    .attr('class', 'grid-link')
                    .style('stroke-opacity', 0.5)
                    .style('stroke-width', function (d) {
                        return 2 * radiusScale(+d['wind']);
                    })
                    .style('stroke', function (d) {
                        return colorScale(d['name']);
                    }); // doesn't seem to do anything?

                nodeLinkG.selectAll('.grid-node')
                    .data(nodes)
                    .enter().append('circle')
                    .attr('class', 'grid-node')
                    .style('fill', function (d) {
                        return colorScale(d['name']);
                    })
                    .style('fill-opacity', 0.6)
                    .attr('r', function (d) {
                        return radiusScale(+d['wind']);
                    })
                    .attr("pointer-events", "visible")
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)
                myMap.on('zoomend', updateLayers);
                updateLayers();
            }
            function updateLayers() {
                nodeLinkG.selectAll('.grid-node')
                    .attr('cx', function (d) { return myMap.latLngToLayerPoint([+d['lat'], +d['long']]).x })
                    .attr('cy', function (d) { return myMap.latLngToLayerPoint([+d['lat'], +d['long']]).y });
                nodeLinkG.selectAll('.grid-link')
                    .attr('x1', function (d) { return myMap.latLngToLayerPoint([+d['lat'], +d['long']]).x })
                    .attr('y1', function (d) { return myMap.latLngToLayerPoint([+d['lat'], +d['long']]).y })
                    .attr('x2', function (d) { return myMap.latLngToLayerPoint([+d['pred_lat'], +d['pred_long']]).x })
                    .attr('y2', function (d) { return myMap.latLngToLayerPoint([+d['pred_lat'], +d['pred_long']]).y });
            };

            readyToDraw(data);
            /*
            nodes = data.map((x) => {
                return 
            })
            */ // could do additional filtering/mapping of data to nodes dataset...
        });
    };

    return chart;
}
