$("#submit").on("click", function() {

  //prevent the page from refreshing on submit
  event.preventDefault();
  var addressInput = $("#address").val();
  console.log(addressInput);


  var queryURL = ("https://data.austintexas.gov/resource/rkrg-9tez.json?$$app_token=YlV86KbCL9cG9m4VO0xTvcqaV&address=" + addressInput);
  console.log(queryURL);






  var queryURL2 = "https://data.austintexas.gov/resource/rkrg-9tez.json?date=2016-02-04T02:00:00.000";

//breaking apart the above query url: api endpoint + data format (json) + date parameter

  // var queryURL = "https://data.austintexas.gov/resource/rkrg-9tez.json?address=7500%20BLOCK%20DELAFIELD%20LN";
  //https://data.austintexas.gov/resource/rkrg-9tez.json?$$app_token=YlV86KbCL9cG9m4VO0xTvcqaV&address=7500%20BLOCK%20DELAFIELD%20LN


  $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(object) {
      console.log(object);
      var address = object[0].address;
          console.log(address);
          var results = object.response;
          console.log("query ran");

      });
  });

  //     	for (i =0; i < results.length; i++) {

		// 	console.log(results[i]);
		// 	$("#list").text(results[i]);

