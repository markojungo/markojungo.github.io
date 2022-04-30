// Load data and use this function to process each row
function dataPreprocessor(row) {
    return {
        'name': row.name,
        'year': +row.year,
        'month': row.month,
        'day': +row.day,
        'hour': +row.hour,
        'lat': +row.lat,
        'long': +row.long,
        'status': +row.status,
        'category': +row.category,
        'wind': +row.wind,
        'pressure': +row.pressure,
        'ts_diameter': row.ts_diameter,
        'hu_diameter': row.hu_diameter,
        'nameyear': row.name + '-' + String(row.year),
        'datetime': d3.timeParse('%d/%m/%Y')(row.datetime),
    };
}

Promise.all([
    d3.csv('frequency.csv', row => {
        return {
            'minor_major': row.minor_major,
            'year': +row.year,
            'count': +row.count
        }
    }),
    d3.csv('frequency_months_daily.csv', row => {
        return {
            'monthday': d3.timeParse('%m-%d')(row.monthday),
            'major': +row.major,
            'minor': +row.minor,
            'none': +row.none,
        }
    }),
    d3.csv('wind_pressure_hourly.csv', function (row) {
        return {
            'hour': +row.hours_since_start,
            'minor_major': row.minor_major,
            'wind': +row.wind,
            'pressure': +row.pressure,
        }
    }),
    d3.csv('map.csv', function (row) {
        return row;
    })
]).then(data => {
    freq = data[0];
    freq_monthly = data[1];
    wind_pressure_hourly = data[2];
    // weather data
    weather_data = data[3];

    var freqPlot = drawFreqPlot();
    d3.select('#freqChart').data([freq]).call(freqPlot);

    var freqMonthlyPlot = drawFreqMonthlyDailyPlot();
    d3.select('#seasonalityChart').data([freq_monthly]).call(freqMonthlyPlot);

    var windPressureHourlyPlot = drawWindPressureHourlyPlot();
    d3.select('#lifetimeChart').data([wind_pressure_hourly]).call(windPressureHourlyPlot);

    var geoPlot = drawGeoPlot();
    d3.select('#geoChart').data([weather_data.filter(function(d){return d['year'] > 2010})]).call(geoPlot); // use data from Ben

})
