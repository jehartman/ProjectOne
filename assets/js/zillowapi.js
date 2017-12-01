var address;
var citystate;

var userLatitude = 30.30;
var userLongitude = -97.71;

var highPrice;
var lowPrice;

var origin;



//---------------------------------------Get data when user inputs info
var search = function(event) {
	event.preventDefault();

	$("#high-price").empty();
	$("#low-price").empty();

	address = $("#user-address").val();
	citystate = $("#user-city-state").val();
	
	var addressConverted = spacesToPlus(address);
	var citystateConverted = spacesToPlus(citystate);


	// zwsid = X1-ZWz18vkeamfbbf_493z4
	var queryURL = "https://galvanize-cors-proxy.herokuapp.com/http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=X1-ZWz18vkeamfbbf_493z4&address=" + addressConverted + "&citystatezip=" + citystateConverted;

	// Performing an AJAX request with the queryURL
	$.ajax({
		url: queryURL,
		method: "GET",
		dataType: "text"
	})
	// After data comes back from the request
	.done(function(response) {
		var parser = new DOMParser();
		var xmlResult = parser.parseFromString(response, "text/xml");
		var jsonObject = xmlToJson(xmlResult);

		console.log(jsonObject);
		
		
		if (jsonObject["SearchResults:searchresults"].response.results.result[0]) {
			userLatitude = parseFloat(jsonObject["SearchResults:searchresults"].response.results.result[0].address.latitude["#text"]);
			userLongitude = parseFloat(jsonObject["SearchResults:searchresults"].response.results.result[0].address.longitude["#text"]);

			highPrice = jsonObject["SearchResults:searchresults"].response.results.result[0].zestimate.valuationRange.high["#text"];
			lowPrice = jsonObject["SearchResults:searchresults"].response.results.result[0].zestimate.valuationRange.low["#text"];
		}
		else {
			userLatitude = parseFloat(jsonObject["SearchResults:searchresults"].response.results.result.address.latitude["#text"]);
			userLongitude = parseFloat(jsonObject["SearchResults:searchresults"].response.results.result.address.longitude["#text"]);

			highPrice = jsonObject["SearchResults:searchresults"].response.results.result.zestimate.valuationRange.high["#text"];
			lowPrice = jsonObject["SearchResults:searchresults"].response.results.result.zestimate.valuationRange.low["#text"];
		}
		
		initMap();

		var formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
		});

		$("#high-price").append(formatter.format(highPrice));
		$("#low-price").append(formatter.format(lowPrice));
	});
};



//------------------------------------Converts XML to JSON
function xmlToJson(xml) {
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};



//-------------------------------- Convert spaces to plus signs
var spacesToPlus = function(text) {
	var newText = "";
	for (var i = 0; i < text.length; i++) {
		if (text[i] == " ") {
			newText += "+";
		}
		else {
			newText += text[i];
		}
	}
	return newText
}




//----------------------------------Google Maps stuff
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;
var directionsDisplay;
var directionsService;

function initMap() {
  var userLocation = {lat: userLatitude, lng: userLongitude};
  map = new google.maps.Map(document.getElementById('map'), {
    center: userLocation,
    zoom: 16
  });
  createNormalMarkers(userLocation, map);
  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: userLocation,
    radius: 500,
    type: ['store']
  }, callback);
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);
}

function callback(results, status){
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i=0; i < results.length; i++) {
      createLetterMarkers(results[i]);
    }
  }
}

function createLetterMarkers(place){
	directionsService = new google.maps.DirectionsService();
	var marker = new google.maps.Marker({
    map: map,
    label: labels[labelIndex++ % labels.length],
    position: place.geometry.location
  });
  google.maps.event.addListener(marker, 'click', function() {
  	if (place.opening_hours) {
  		if (place.opening_hours.open_now) {
  			placeOpenNow = "Yes!!"
  		}
  		else {
  			placeOpenNow = "No, not right now."
  		}
  	}
  	else {
  		placeOpenNow = "Not sure, Sorry :("
  	}

  	console.log(place);

    infowindow.setContent("<h5>" + place.name + "</h5><h7>" + place.vicinity + "<br>Open Now:  " + placeOpenNow + "</h7>");
    infowindow.open(map, this);

	var start = origin;
	console.log(start);
	console.log(place);
	var end = place.place_id;
	console.log(end);
	var request = {
		origin: start,
		destination: end,
		travelMode: 'DRIVING'
  	};
  	directionsService.route(request, function(result, status) {
  		if (status == "OK") {
  			directionsDisplay.setDirections(result);
  		}
  	})

  });
}

function createNormalMarkers(place){
  var marker = new google.maps.Marker({
    map: map,
    position: place,
  });
  origin = place;
}

$("#user-address").val("7405 Sevilla Dr");
$("#user-city-state").val("Austin TX");


$("#btnSubmit").on("click", search)