function initMap() {
  var austin = {lat:30.30, lng: -97.71};
  map = new google.maps.Map(document.getElementById('map'), {
    center: austin,
    zoom: 10
  });
  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: austin,
    radius: 500,
    type: ['store']
  }, callback);
}// end init map function do not delete
function callback(results, status){
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i=0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}
function createMarker(place){
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}


