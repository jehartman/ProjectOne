//--------------------------------------- Zillow API
var address;
var citystate;
var highPrice;
var lowPrice;


var search = function(event) {
	event.preventDefault();

	// --- Empty divs of any previous searches
	$("#high-price").empty();
	$("#low-price").empty();

	// --- Save user inputs as variables
	address = $("#user-address").val();
	citystate = $("#user-city-state").val();
  if (citystate.indexOf(",") !== -1) {
    console.log("there's a comma");
    $("#errorMessage").css("visibility", "visible");
		console.log("Visibility = " + $("#errorMessage").attr("visibility"));
    return;
  }

  else {
    console.log("no comma");
    $("#errorMessage").css("visibility", "hidden");
		$(".prices").css("visibility", "visible");
  }


	// --- Convert Spaces to plus signs
	var addressConverted = spacesToPlus(address);
	var citystateConverted = spacesToPlus(citystate);

	// zwsid = X1-ZWz18vkeamfbbf_493z4
	var queryURL = "https://galvanize-cors-proxy.herokuapp.com/http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=X1-ZWz18vkeamfbbf_493z4&address=" + addressConverted + "&citystatezip=" + citystateConverted;

	// --- Performing an AJAX request with the queryURL
	$.ajax({
		url: queryURL,
		method: "GET",
		dataType: "text"
	})
	// --- After data comes back from the request
	.done(function(response) {
		// --- Convert the Zillow response from XML to JSON
		var parser = new DOMParser();
		var xmlResult = parser.parseFromString(response, "text/xml");
		var jsonObject = xmlToJson(xmlResult);

		// --- Get desired data from JSON
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

		// --- Load Map with provided Latitude and Longitude
		initMap();

		// --- Thing to make prices look fancy
		var formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
		});

		// --- Display formatted prices
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
}



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
	return newText;
};




//----------------------------------Google Maps stuff
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var userLocation;

// --- Whenever the map is loaded...
function initMap() {
	// --- Thing needed for directions to display properly
	directionsDisplay = new google.maps.DirectionsRenderer();

	// --- Saving our Longitude and Latidute we got from Zillow
	userLocation = new google.maps.LatLng(userLatitude, userLongitude);

	// --- Defining the map
	map = new google.maps.Map(document.getElementById('map'), {
		center: userLocation,
		zoom: 16
	});

	// --- Create a normal marker for the input address
	createNormalMarkers(userLocation, map);

	// --- Thing needed so the information bubbles work
	var infowindow = new google.maps.InfoWindow();

	// --- Finding interesting things in the area
	var service = new google.maps.places.PlacesService(map);
	service.nearbySearch({
		location: userLocation,
		radius: 500,
		type: ['store', 'point_of_interest']
	}, callback);

	// --- Once we have directions, display them on the map
	directionsDisplay.setMap(map);
}

// --- This makes a Lettered Marker for each interesting thing
function callback(results, status){
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		for (var i=0; i < results.length; i++) {
			createLetterMarkers(results[i]);
		}
	}
}

// --- Function that actually makes the Lettered Markers
function createLetterMarkers(place){
	// --- Makes each marker
	var marker = new google.maps.Marker({
		map: map,
		label: labels[labelIndex++ % labels.length],
		position: place.geometry.location
	});

	// --- On-click listener made for each marker
	google.maps.event.addListener(marker, 'click', function() {
		// --- Figuring out Store Hours
		if (place.opening_hours) {
			if (place.opening_hours.open_now) {
				placeOpenNow = "Yes!!";
			}
			else {
				placeOpenNow = "No, not right now.";
			}
		}
		// --- Displays if Google doesn't have info for this place
		else {
			placeOpenNow = "No data";
		}

		// --- Defines what appears in the information bubble
		infowindow.setContent("<h5>" + place.name + "</h5><h7>" + place.vicinity + "<br>Open Now:  " + placeOpenNow + "</h7>");
		infowindow.open(map, this);

		// --- Defines our Directions request
		var request = {
			origin: userLocation,
			destination: place.geometry.location,
			travelMode: 'DRIVING'
		};

		// --- Get directions from Google
		directionsService.route(request, function(result, status) {
			if (status == "OK") {
				directionsDisplay.setDirections(result);
			}
		});
	});
}

// --- Function that makes the normal marker
function createNormalMarkers(place){
	var marker = new google.maps.Marker({
		map: map,
		position: place,
	});
}

// --- On-click listener for the Submit button
$("#btnSubmit").on("click", search);
