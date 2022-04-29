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
    })
]).then(data => {
    freq = data[0];
    freq_month_day = data[1];

    var freqPlot = drawFreqPlot();
    d3.select('#freqChart').data([freq]).call(freqPlot);

    var freqMonthlyDailyPlot = drawFreqMonthlyDailyPlot();
    d3.select('#seasonalityChart').data([freq_month_day]).call(freqMonthlyDailyPlot);
})
