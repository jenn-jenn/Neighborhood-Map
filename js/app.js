var proxyURL = 'https://cors-anywhere.herokuapp.com';
var API_KEY = "4NgnM8URd6l42HA5Eyl3nTox-Wqz00BRfkBeR2wHY0xsILyPexJ3JEeoRJ0YwDVOY6iiH8j3kpo3BWvgVmgA22SQGJ9oz1nhhAPXgS10h7TcXCEqpWUSL-MhixBgWnYx";
var businessInfo;
var businessID;
var businessRating;
var businessAddress;
var businessAddress2;
var currMarker;

function initMap() {

	var locations = [
		{title: 'TeaOne', location: {lat: 37.780908, lng: -122.476851}},
		{title: 'The Burrow', location: {lat: 37.683671, lng: -122.402944}},
		{title: 'Mr. T Cafe', location: {lat: 37.723500, lng: -122.435639}},
		{title: 'T4', location: {lat: 37.617813, lng: -122.395200}},
		{title: 'Sharetea', location: {lat: 37.891516, lng: -122.266048}},
		{title: 'Gongcha', location: {lat: 37.579691, lng: -122.327598}}
	];

	var map;
	var markers = [];

	var center = {lat: 37.705412, lng: -122.444260};
	var largeInfowindow;

	largeInfowindow = new google.maps.InfoWindow();

	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 10,
		center: center
	});

	authenticateYelp();

	largeInfowindow.addListener('closeclick', function(){
		this.marker.setAnimation(null);
	});

	function populateInfoWindow(marker, infowindow) {
		if(infowindow.marker != marker) {
			infowindow.marker = marker;
			marker.setAnimation(google.maps.Animation.BOUNCE);
			yelpSearch(marker, infowindow);

			infowindow.open(map, marker);

			infowindow.addListener('closeclick', function() {
				infowindow.marker = null;
			});
		}
		currMarker = marker;
	} // QUESTION: why does previous marker's infowindow content shows up in another markers

	// knockout for list, filter, and anything subject to change, tracking click events on list
	// NOT by knockout Maps API, creating markers, tracking click events on markers, making map, refreshing map
	function ViewModel(locations) {

		this.locObservableArray = ko.observableArray(locations);
		this.search = ko.observable('');

		this.markersObservableArray = ko.observableArray();
		this.filteredArray = ko.observableArray();

		// filters and show only those that is a possible match
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

		// creates the markers in the beginning when the page loads
		this.createMarkers = ko.computed(function() {
			locations.forEach(function(location) {
				location.marker = new google.maps.Marker({
					position: location.location,
					title: location.title,
					animation: google.maps.Animation.DROP,
					map: map
				});
				markers.push(location.marker);
				markersObservableArray.push(location.marker);
				location.marker.addListener('click', function() {
					if(currMarker.getAnimation() !== null){
						currMarker.setAnimation(null);
					}
					populateInfoWindow(location.marker, largeInfowindow);
				});
			});
			currMarker = markers[markers.length-1];
		}, this);

		// animates when an item in the list is clicked
		this.listClick = function() {
			if(currMarker.getAnimation() !== null){
				currMarker.setAnimation(null);
			}
			this.setAnimation(google.maps.Animation.BOUNCE);
			populateInfoWindow(this, largeInfowindow);
		};
	}
	ko.applyBindings(ViewModel(locations));
}

// authenitcates to use Yelp API
function authenticateYelp() {

	var settings = {
	  "async": true,
	  "crossDomain": true,
	  "url": proxyURL + '/' + "https://api.yelp.com/v3/businesses/search?title=teaone&latitude=37.780908&longitude=-122.476851&limit=10",
	  "method": "GET",
	  "headers": {
	    "authorization": "Bearer 4NgnM8URd6l42HA5Eyl3nTox-Wqz00BRfkBeR2wHY0xsILyPexJ3JEeoRJ0YwDVOY6iiH8j3kpo3BWvgVmgA22SQGJ9oz1nhhAPXgS10h7TcXCEqpWUSL-MhixBgWnYx",
	    "cache-control": "no-cache",
	  }
	}

	$.ajax(settings).done(function (response) {
	  console.log("authenitcated");
	})
	.fail(function() {
		console.log("authenitcation error");
		document.getElementById("map").style.display = "none";
		document.getElementById("error").style.display = "block";
	});
}

// uses the yelp api
function yelpSearch(marker, infowindow) {

	var latitude = marker.getPosition().lat();
	var longitude = marker.getPosition().lng();
	var title = marker.title;

	var settings = {
	  "async": true,
	  "crossDomain": true,
	  "url": proxyURL + '/' + "https://api.yelp.com/v3/businesses/searc?" + "term=" + title + "&latitude=" + latitude + "&longitude=" + longitude + "&limit=10",
	  "method": "GET",
	  "headers": {
	    "authorization": "Bearer 4NgnM8URd6l42HA5Eyl3nTox-Wqz00BRfkBeR2wHY0xsILyPexJ3JEeoRJ0YwDVOY6iiH8j3kpo3BWvgVmgA22SQGJ9oz1nhhAPXgS10h7TcXCEqpWUSL-MhixBgWnYx",
	    "cache-control": "no-cache",
	  }
	}

	$.ajax(settings).done(function (response) {
		storeBusiness(response, infowindow, marker);
	})
	.fail(function(){
		console.log("search error");
		document.getElementById("map").style.display = "none";
		document.getElementById("error").style.display = "block";
	});

};

function storeBusiness(response, infowindow, marker) {
	businessInfo = response.businesses[0];
	businessID = businessInfo.id;
	businessAddress = businessInfo.location.display_address[0]; // number address
	businessAddress2 = businessInfo.location.display_address[1]; // city, zip

	var content = '<div>' + marker.title + '</div>' +
	'<div>' + businessAddress + '</div>' +
	'<div>' + businessAddress2 + '</div>';
	infowindow.setContent(content);
}