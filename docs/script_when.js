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

    var config = { displayModeBar: false}
    

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
                type: "category",
                categoryorder: "array",
                categoryarray: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
                tickwidth: 2,
                tickfont: {
                    size: 14
                },
                tickmode: "array",
                tickvals: [0, 4, 10.5, 14.5, 18.5, 25],
                ticktext: ['full moon', 'waxing crescent', 'waxing gibbous', 'new moon', 'waning gibbous', 'waning crescent'],
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
    Plotly.newPlot('lunar', lunar_data, lunar_layout, config);

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
                tickvals: [0, 90, 180, 270],
                ticktext: ['high','falling', 'low', 'rising'],
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

    Plotly.newPlot('tidal', tidal_data, tidal_layout, config);

})

