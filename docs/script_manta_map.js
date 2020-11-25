function coordinate_parser(string) {
  data = string.split(/[°'"\s]/);
  ret = Number(data[0]) + Number(data[1] / 60.0) + Number(data[2] / 3600.0)
  if (data[4] == 'W') {
    ret *= -1
  }
  return ret
}
//INITIAL BULIT FOR THE MAP
function createPopup(dataPoint) {
  //add image
  str = '<div><img src = '
  //str += 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Stack_Exchange_logo_and_wordmark.svg/375px-Stack_Exchange_logo_and_wordmark.svg.png'
  str += 'images/mantapics/' + dataPoint.ID.toString() + '.jpg';
  str += ' height="200"><hr>';
  str += '<div>DATE: ' + dataPoint.Mo + '/' + dataPoint.Da + '/' + dataPoint.Yr + '<br>';
  str += 'Latitude: ' + dataPoint.Latitude + '<br>';
  str += 'Longitude: ' + dataPoint.Longitude + '<br>';
  str += 'Time: '
  time = Number(dataPoint.Time)
  hour = Math.floor(time)
  min = Math.round(6000 * (time - hour)) / 100
  if (hour > 12) { hour -= 12 };
  str += hour.toString() + ':' + min.toString()
  str += time > 12 ? 'PM' : 'AM';
  str += '<br>Group Size: ' + dataPoint.Group_Size;
  str += '</div>'

  return str;
}

d3.csv('./data/clean_data.csv', function (data) {
  circles = [];

  coordinates = []

  for (var i = 0; i < data.length; i++) {
    num = Number(data[i].Group_Size);
    if (num == 0) { continue; }
    lon = coordinate_parser(data[i].Longitude);
    lat = coordinate_parser(data[i].Latitude);
    coordinates.push([lat, lon, num]);
    var temp = L.divIcon({ popupAnchor: [100, 30] });
    circle = L.circle([lat, lon], {
      weight: 0.2,
      color: 'white',
      fillcolor: 'yellow',
      fillOpacity: 0.5,
      radius: 16
    });

    popupContent = document.createElement("img");
    popupContent = createPopup(data[i]);
    circle.bindPopup(popupContent, {
      maxWidth: "auto"
    });
    circles.push(circle);
  }//iterate through each lat/long

  for (i = 0; i < circles.length; i++) {
    circles[i].addTo(mymap);
  }
  var heat = L.heatLayer(coordinates, { radius: 25 }).addTo(mymap)
})

var mymap = L.map('map_mantas').setView([21.48, -157.82], 14.);;
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


var lower = 0;
var upper = 28;
function update(){
  console.log('hello world')
}


