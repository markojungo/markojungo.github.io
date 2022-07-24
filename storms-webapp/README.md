# Storms Webapp
D3.js webapp visualizing Atlantic hurricanes.

## How to run
`python -m http.server 8080` or visit https://markojungo.github.io/storms-webapp/.

## Notes
For a few plots, rather than wrangle the data with `d3.nested()` or `d3.group`
and `d3.rollup`, we used Python to transform the data into the required shape
and used `d3` to draw the visualization from there. No additional data were used.