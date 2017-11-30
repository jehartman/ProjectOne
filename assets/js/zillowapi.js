var address;
var citystate;

var userLatitude = 30.30;
var userLongitude = -97.71;






//---------------------------------------Get data when user inputs info
var search = function(event) {
	event.preventDefault();
	address = $("#user-address").val();
	citystate = $("#user-city-state").val();
	console.log(address);
	console.log(citystate);

	var addressConverted = spacesToPlus(address);
	var citystateConverted = spacesToPlus(citystate);

	console.log(addressConverted);
	console.log(citystateConverted);

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
		console.log(response);
		var parser = new DOMParser();
		var xmlResult = parser.parseFromString(response, "text/xml");
		var jsonObject = xmlToJson(xmlResult);
		
		
		userLatitude = parseFloat(jsonObject["SearchResults:searchresults"].response.results.result.address.latitude["#text"]);

		userLongitude = parseFloat(jsonObject["SearchResults:searchresults"].response.results.result.address.longitude["#text"]);
		console.log(userLatitude);
		console.log(userLongitude);
		initMap();

		var highPrice = jsonObject["SearchResults:searchresults"].response.results.result.zestimate.valuationRange.high["#text"];
		var lowPrice = jsonObject["SearchResults:searchresults"].response.results.result.zestimate.valuationRange.low["#text"];

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
	console.log(newText);
	return newText
}




//-------------------------------- add commas to prices
// var addCommas = function(price) {
// 	console.log(price);
// 	var newPrice;
// 	for (var i = price.length; i < 0; i--) {
// 		if (newPrice.length == 3 || newPrice.length == 7) {
// 			newPrice.prepend(",");
// 			newPrice.prepend(price[i]);
// 			console.log(price);
// 			console.log(newPrice);
// 		}
// 		else {
// 			newPrice.prepend(price[i]);
// 			console.log(newPrice)
// 		}
// 	}
// 	console.log(newPrice);
// 	return newPrice;
// }








//----------------------------------Google Maps stuff
function initMap() {
  var austin = {lat: userLatitude, lng: userLongitude};
  map = new google.maps.Map(document.getElementById('map'), {
    center: austin,
    zoom: 16
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




$("#user-address").val("7405 Sevilla Dr");
$("#user-city-state").val("Austin TX");


$("#btnSubmit").on("click", search)