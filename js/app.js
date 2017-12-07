var proxyURL = 'https://cors-anywhere.herokuapp.com';
var access_token;
var businessInfo;
var businessID;
var businessRating;
var businessAddress;

function initMap() {

	var locations = [
		{title: 'TeaOne', location: {lat: 37.780908, lng: -122.476851}},
		{title: 'The Burrow', location: {lat: 37.683671, lng: -122.402944}},
		{title: 'Mr. T Cafe', location: {lat: 37.723500, lng: -122.435639}},
		{title: 'T4', location: {lat: 37.617813, lng: -122.395200}},
		{title: 'Sharetea', location: {lat: 37.891516, lng: -122.266048}},
		{title: 'Gongcha', location: {lat: 37.579691, lng: -122.327598}}
	]

	var map;
	var markers = [];
	// function initMap() {

	var center = {lat: 37.705412, lng: -122.444260}
	var largeInfowindow;

	largeInfowindow = new google.maps.InfoWindow();

	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 10,
		center: center
	});

	authenticateYelp();

	function populateInfoWindow(marker, infowindow) {
		if(infowindow.marker != marker) {
			infowindow.marker = marker;

			// infowindow.setContent('<div>' + marker.title + '</div>');
			yelpSearch(marker);
			var content = '<div>' + marker.title + '</div>' +
			'<div>' + businessAddress + '</div>';
			// '<div>' + businessAddress[1] + '</div>'
			infowindow.setContent(content);
			infowindow.open(map, marker);
			infowindow.addListener('closeclick', function() {
				infowindow.marker = null;
			});
		}
	}

	// knockout for list, filter, and anything subject to change, tracking click events on list
	// NOT by knockout Maps API, creating markers, tracking click events on markers, making map, refreshing map
	function viewModel(locations) {

		this.locObservableArray = ko.observableArray(locations);
		this.search = ko.observable('');

		this.markersObservableArray = ko.observableArray();
		this.filteredArray = ko.observableArray();

		this.filterSearch = ko.computed(function() {
			var search = this.search().toLowerCase();
			if(!search) {
				for(var i = 0; i < markersObservableArray().length; i++){
					markersObservableArray()[i].setVisible(true);
				}
				return this.markersObservableArray();
			}
			else {
				this.filteredArray = this.markersObservableArray().filter(function(boba) {
					if(boba.title.toLowerCase().indexOf(search) == -1){
						boba.setVisible(false);
					}
					else {
						boba.setVisible(true);
						return(boba.title.toLowerCase().indexOf(search) > -1);
					}
				});
				return this.filteredArray;
			}
		}, this);

		this.createMarkers = ko.computed(function() {
			for(var i = 0; i < locations.length; i++){
				var position = locations[i].location;
				var title = locations[i].title;
				var marker = new google.maps.Marker({
					position: position,
					title: title,
					animation: google.maps.Animation.DROP,
					map: map
				});
				markers.push(marker);
				markersObservableArray.push(marker);
				marker.addListener('click', function() {
					populateInfoWindow(this, largeInfowindow);
				});
			}
		}, this);

		this.listClick = function() {

			populateInfoWindow(this, largeInfowindow);
		}
	};

	ko.applyBindings(viewModel(locations));
}

function authenticateYelp() {

	var requestURL = 'https://api.yelp.com/oauth2/token';
	var request = new XMLHttpRequest();
	// var body = {
	// 	grant_type: "client_credentials\n",
	// 	client_id: "HH-wWLOGhsYppUim8k_DDw",
	// 	client_secret: "4mqMq733uKpPi4LEGpHGPseJ9iDezRVOSREJbbbDJ9kUZXbV702BsqduZ5WQELUX"
	// }
	var jsonResponse;

	request.open('POST', proxyURL + '/' + requestURL, true);
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.send("grant_type=client_credentials&client_id=HH-wWLOGhsYppUim8k_DDw&client_secret=4mqMq733uKpPi4LEGpHGPseJ9iDezRVOSREJbbbDJ9kUZXbV702BsqduZ5WQELUX");

	request.onreadystatechange = function() {
		if(request.readyState == 4 && request.status == 200){
			var jsonResponse = JSON.parse(request.response);
			storeToken(jsonResponse);
		}
	}
}
function storeToken(response) {
	access_token = response.access_token;
}

function yelpSearch(marker) {
	var searchURL = 'https://api.yelp.com/v3/businesses/search';
	var request = new XMLHttpRequest();
	var latitude = marker.getPosition().lat();
	var longitude = marker.getPosition().lng();
	var title = marker.title;
	var params = "term=" + title + "&latitude=" + latitude + "&longitude=" + longitude + "&limit=10";
	var jsonResponse;
	request.open('GET', proxyURL + '/' + searchURL + "?" + params, true);
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.setRequestHeader("Authorization", "Bearer " + access_token);
	request.send();

	request.onreadystatechange = function() {
		if(request.readyState == 4 && request.status == 200) {
			jsonReponse = JSON.parse(request.response);
			storeBusiness(jsonReponse);
		}
	}
}

function storeBusiness(response) {
	businessInfo = response.businesses[0];
	businessID = businessInfo.id;
	businessAddress = businessInfo.location.display_address[0];
	console.log(businessInfo);
	// console.log(businessID);
	console.log(businessAddress);
}