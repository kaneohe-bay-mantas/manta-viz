function coordinate_parser(string){
  data = string.split(/[°'"\s]/);
  ret = Number(data[0]) + Number(data[1]/60.0) + Number(data[2]/3600.0)
  if(data[4] == 'W'){
    ret *= -1
  }
  return ret
}

d3.csv('../data/clean_data.csv', function(data) {
  circles = [];

  coordinates = []

  for(var i =0; i < data.length; i ++){
    if(data[i].Group_Size == 0){continue;}
    lon = coordinate_parser(data[i].Longitude);
    lat = coordinate_parser(data[i].Latitude);
    coordinates.push([lat, lon, 10]);
  //   circle = L.circle([lat, lon], {
  //     weight: 0.5,
  //     color: 'black',
  //     fillcolor: 'yellow',
  //     fillOpacity: 1,
  //     radius: 8
  //   });
  //   circles.push(circle);
   }
  // for (i=0; i<circles.length; i++){
  //   circles[i].addTo(mymap);
  // }
   var heat = L.heatLayer(coordinates, {radius:25}).addTo(mymap)
})


var mymap = L.map('map_mantas').setView([21.48, -157.82], 14.);;
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: 20,
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox/light-v9',
  tileSize: 512,
  zoomOffset: -1
}).addTo(mymap);