// based on code from https://gist.github.com/endel/dfe6bb2fbe679781948c
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
    b = Math.round(jd * 29); //scale fraction from 0-28 and round
    if (b >= 29) {
        b = 0; //0 and 8 are the same so turn 8 into 0
    }


    return b;
}

// variables to remember:
// today: today's date
// day0: first day on calendar
// date_array: date objects for calendar
// short_dates: calendar dates in MM-DD format
// lunar_days: calendar converted to lunar days
// date_labels: labels to print on calendar. 1st date and any 1st of the month dates include month

var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]

var today = new Date();
console.log(today)

var day0 = new Date(today)
day0.setDate(day0.getDate() - day0.getDay())

var date_array = []
var short_dates = []
var date_labels = []
var lunar_days = []
for (let i = 0; i < 28; i++) {
    tempday = new Date(day0)
    tempday.setDate(tempday.getDate() + i)
    date_array.push(tempday)
    date = tempday.getDate()
    month = tempday.getMonth()
    year = tempday.getFullYear()
    temp = month + "-" + date
    short_dates.push(temp)
    lunar = getMoonPhase(year, month, date)
    lunar_days.push(lunar)
    if (i == 0 || date == 1) {
        date_labels.push(months[month] + " " + date)
    }  else {
        date_labels.push(date)
    }
}

console.log(short_dates)
console.log("lunar: " + lunar_days)

var margin = { top: 30, right: 30, bottom: 30, left: 30 },
    width = (0.5 * $(window).width()) - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#calendar-heatmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Labels of row and columns

var myVars = ["w1", "w2", "w3", "w4"]

// Build X scales and axis:
var x = d3.scaleBand()
    .range([0, width])
    .domain([0,1,2,3,4,5,6])
    .padding(0.01);
var topAxis = d3.axisTop(x)
    .tickSize(0)
    .tickFormat(function (d) { return weekdays[d]; })
svg.append("g")
    .style("font", "14pt Asap")
    .call(topAxis)

// Build Y scales and axis:
var y = d3.scaleBand()
    .range([height, 0])
    .domain([3,2,1,0])
    .padding(0.01);
// var yAxis = d3.axisLeft(y)
//     .tickSize(0)
//     .tickFormat("")
// svg.append("g")
//     .call(yAxis);


//Read the data
d3.csv("./data/calendar_data.csv", function (data) {
    console.log(data)

    //
    var corr_values = []
    for (i in lunar_days) {
        if(i >= 20) {
            if (i == 20) {
                temp_avg = (parseFloat(data[19].Group_Size) + parseFloat(data[21].Group_Size)) / 2
                corr_values.push(temp_avg)
            } else {
                corr_values.push(parseFloat(data[i - 1].Group_Size))
            }
        } else {
            corr_values.push(parseFloat(data[i].Group_Size))
        }
    }
    console.log(corr_values)

    //build data
    var data_coords = []
    for (i in lunar_days) {
        var d = i % 7
        var w = Math.floor(i / 7)
        var v = corr_values[i]
        
        data_coords.push({
            'day': d,
            'week': w,
            'value': v,
            'lunar_day': lunar_days[i],
            'date': date_labels[i]
        })
    }
    console.log(data_coords)

    // get data range
    var data_max = Math.max(...corr_values) 

    // Build color scale
    var myColor = d3.scaleLinear()
        .range(["white", "#69b3a2"])
        .domain([0, data_max])

    var block = svg.selectAll("g")
        .data(data_coords, function (d) { return d })
        .enter()
        .append("g")
    
    block.append("rect")
        .attr("x", function (d) { return x(d.day) })
        .attr("y", function (d) { return y(d.week) })
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function (d) { return myColor(d.value) })
    
    block.append("text")
        .attr("x", function (d) { return x(d.day) })
        .attr("y", function (d) { return y(d.week) })
        .text(function (d) { return d.date; })
        .attr("text-anchor", "end")
        .attr("transform", "translate(" + ((width / 7)-10) + ", " + 20 + ")");

})