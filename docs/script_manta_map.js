function coordinate_parser(string) {
  data = string.split(/[°'"\s]/);
  ret = Number(data[0]) + Number(data[1] / 60.0) + Number(data[2] / 3600.0)
  if (data[4] == 'W') {
    ret *= -1
  }
  return ret
}
var circleLayer;
var healLayer;
d3.csv('./data/clean_data.csv', function (data) {
  circles = [];


  coordinates = []

  for (var i = 0; i < data.length; i++) {
    num = Number(data[i].Group_Size);
    if (num == 0) { continue; }
    lon = coordinate_parser(data[i].Longitude);
    lat = coordinate_parser(data[i].Latitude);
    coordinates.push([lat, lon, num]);
    //var temp = L.divIcon({ popupAnchor: [100, 30] });
    circle = L.circle([lat, lon], {
      weight: 0.2,
      color: 'white',
      fillcolor: 'yellow',
      fillOpacity: 0.5,
      radius: 16
    }).on('click', showPic.bind(null, data[i].ID,
                                      data[i].Mo,
                                      data[i].Da,
                                      data[i].Yr,
                                      data[i].Latitude,
                                      data[i].Longitude,
                                      data[i].Time,
                                      data[i].Group_Size
                                      ));
    circles.push(circle);
  }//iterate through each lat/long
  circleLayer = L.layerGroup(circles).addTo(mymap);
  heatLayer = L.heatLayer(coordinates, { radius: 25 }).addTo(mymap)
})

var mymap = L.map('map_mantas').setView([21.48, -157.825], 15);;
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(mymap);

$(function () {
  $("#slider-range").slider({
    range: true,
    min: 0,
    max: 28,
    values: [0, 28],
    slide: function (event, ui) {
      $("#amount").val("Day " + ui.values[0] + " - Day " + ui.values[1]);
      lower = ui.values[0];
      upper = ui.values[1];
    }
  });
  $("#amount").val("Day " + $("#slider-range").slider("values", 0) +
    " - Day " + $("#slider-range").slider("values", 1));
});

function showPic(id, mo, da, yr, lat, lon, time, gsize) {
  str = '<div><img src = '
  str += 'images/mantapics/' + id.toString() + '.jpg';
  str += ' height="200"><hr>';
  str += '<div>DATE: ' + mo + '/' + da + '/' + yr + '<br>';
  str += 'Latitude: ' + lat + '<br>';
  str += 'Longitude: ' + lon + '<br>';
  str += 'Time: '
  time = Number(time)
  hour = Math.floor(time)
  min = Math.round(6000 * (time - hour)) / 100
  if (hour > 12) { hour -= 12 };
  if (min<10) {min = '0' + min.toString()}
  str += hour.toString() + ':' + min.toString()
  str += time > 12 ? 'PM' : 'AM';
  str += '<br>Group Size: ' + gsize;
  str += '</div>'

  document.getElementById('show_pic').innerHTML = str;
}

var lower = 0;
var upper = 28;

function update() {
  lower = $("#slider-range").slider("values", 0);
  upper = $("#slider-range").slider("values", 1);
  //remove the layer
  mymap.removeLayer(circleLayer);
  mymap.removeLayer(heatLayer);
  //######################################################
  d3.csv('./data/clean_data.csv', function (data) {
    circles = [];
    coordinates = []
  
    for (var i = 0; i < data.length; i++) {
      num = Number(data[i].Group_Size);
      if (num == 0) { continue; }
      lon = coordinate_parser(data[i].Longitude);
      lat = coordinate_parser(data[i].Latitude);
      lDay = Math.round(Number(data[i].lunar_deg) * 28.0 / 360);
      //console.log(lDay);
      if(lDay < lower){continue};
      if(lDay>upper){continue};
      coordinates.push([lat, lon, num]);
      circle = L.circle([lat, lon], {
        weight: 0.2,
        color: 'white',
        fillcolor: 'yellow',
        fillOpacity: 0.5,
        radius: 16
      }).on('click', showPic.bind(null, data[i].ID,
                                        data[i].Mo,
                                        data[i].Da,
                                        data[i].Yr,
                                        data[i].Latitude,
                                        data[i].Longitude,
                                        data[i].Time,
                                        data[i].Group_Size
                                        ));
      circles.push(circle);
    }//iterate through each lat/long
    circleLayer = L.layerGroup(circles).addTo(mymap);
    heatLayer = L.heatLayer(coordinates, { radius: 25 }).addTo(mymap)
  })

}

//document.getElementById('show_pic').innerHTML = 'Hello world'

// function lunar_day(dFull, mFull, yFull, dCurr, mCurr, yCurr){
//   //inputs are numerical values
//   fullDay = new Date(yFull, mFull, dFull);
//   currDay = new Date(yCurr, mCurr, dCurr);
//   return currDay - fullDay;
// }