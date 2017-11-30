var address;
var citystate;




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
		var jsonObject = JSON.stringify(xmlToJson(xmlResult));
		console.log(jsonObject);
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




$("#btnSubmit").on("click", search)