// from https://gist.github.com/endel/dfe6bb2fbe679781948c
function getMoonPhase(year, month, day) {
    var c = e = jd = b = 0;
    if (month < 3) {
        year--;
        month += 12;
    }
    ++month;
    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09; //jd is total days elapsed
    jd /= 29.5305882; //divide by the moon cycle
    b = parseInt(jd); //int(jd) -> b, take integer part of jd
    jd -= b; //subtract integer part to leave fractional part of original jd
    b = Math.round(jd * 8); //scale fraction from 0-8 and round
    if (b >= 8) {
        b = 0; //0 and 8 are the same so turn 8 into 0
    }
    // 0 => New Moon
    // 1 => Waxing Crescent Moon
    // 2 => Quarter Moon
    // 3 => Waxing Gibbous Moon
    // 4 => Full Moon
    // 5 => Waning Gibbous Moon
    // 6 => Last Quarter Moon
    // 7 => Waning Crescent Moon

    return b;
}

Plotly.d3.csv('./data/polar_data.csv', function (err, rows) {
    function unpack(rows, key) {
        return rows.map(function (row) { return row[key]; });
    }
    console.log(rows);

    var days = unpack(rows, 'lunar_deg');
    for (i in days) {
        days[i] = Math.round(days[i] * 28 / 360)
    }
    console.log(days)

    var lunar_data = [
        {
            type: "scatterpolar",
            name: "angular categories",
            r: unpack(rows, 'Group_Size'),
            theta: days,
            mode: "markers",
            name: "Group Size",
            marker: {
                color: "#46CF91",
                size: 15,
                line: {
                    color: "white"
                },
                opacity: 0.7
            },
            //cliponaxis: false,
            hovertext: "test",
            hovertemplate: "%{r} mantas, \n <extra>%{theta} days since the full moon</extra>"
        }
    ]

    var lunar_layout = {
        title: "by Lunar Day",
        font: {
            family: 'ABeeZee',
            size: 15
        },
        showlegend: false,
        polar: {
            bgcolor: "rgb(223, 223, 223)",
            angularaxis: {
                title: "Days since the full moon",
                type: "category",
                categoryorder: "array",
                categoryarray: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
                tickwidth: 2,
                tickfont: {
                    size: 14
                },
                ticktext: [0, 7, 14, 21],
                linewidth: 3,
                layer: "below traces",
                title: "Lunar Day",
                gridcolor: "#8EC1ED"

            },
            radialaxis: {
                side: "counterclockwise",
                showline: true,
                linewidth: 2,
                tickwidth: 2,
                tickfont: {
                    color: "#437860",
                    size: 12
                },
                gridcolor: "white",
                gridwidth: 2,
                title: "Group Size",
                titlefont: {
                    color: '#437860',
                    size: 12
                }
            }
        },
        paper_bgcolor: "rgb(223, 223, 223)",
    }
    Plotly.newPlot('lunar', lunar_data, lunar_layout);

    /////// Plot 2: tide data ///////////////////////////////
    var tidal_data = [
        {
            type: "scatterpolar",
            name: "angular categories",
            r: unpack(rows, 'Group_Size'),
            theta: unpack(rows, 'Tidal_phase'),
            mode: "markers",
            name: "Group Size",
            marker: {
                color: "#8EC1ED",
                size: 15,
                line: {
                    color: "white"
                },
                opacity: 0.7
            },
            //cliponaxis: false,
            text: unpack(rows, 'date'),
            //hovertext: "test",
            hovertemplate: "%{r} mantas, /n <extra> %{text}"
        }
    ]

    var tidal_layout = {
        title: "by Tidal Phase",
        font: {
            family: 'ABeeZee',
            size: 14
        },
        showlegend: false,
        polar: {
            bgcolor: "rgb(223, 223, 223)",
            angularaxis: {
                rotation: 90,
                tickmode: "array",
                tickvals: [0, 180],
                ticktext: ['high/rising?', 'low/falling?'],
                tickwidth: 2,
                tickfont: {
                    size: 14
                },
                linewidth: 3,
                layer: "below traces",
                title: "tidal Day",
                gridcolor: "#8EC1ED"

            },
            radialaxis: {
                side: "counterclockwise",
                showline: true,
                linewidth: 2,
                tickwidth: 2,
                tickfont: {
                    color: "#437860",
                    size: 12
                },
                gridcolor: "white",
                gridwidth: 2,
                title: "Group Size",
                titlefont: {
                    color: '#437860',
                    size: 12
                }
            }
        },
        paper_bgcolor: "rgb(223, 223, 223)",
    }

    Plotly.newPlot('tidal', tidal_data, tidal_layout);

})