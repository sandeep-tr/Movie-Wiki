var baseImageURL = '';
var castSize = 5;

/*Called when form is initialized. Gets the image base URL 
and sets the baseImageURL for later calls*/
function initialize(){
	
	//-- Retrieve the base URL to be used for images
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "proxy.php?method=/3/configuration");
	xhr.setRequestHeader("Accept","application/json");
	xhr.onreadystatechange = function(){
	   if (this.readyState == 4) {
		  var json = JSON.parse(this.responseText);
		  setBaseImageURL(json);
	   }
	};
	xhr.send(null);
}

function setBaseImageURL(configData){
	
	//-- Setting the global URL variable for requesting images
	baseImageURL = configData.images.base_url + configData.images.poster_sizes[1];
}

/*Calls TMDb API through proxy to get search results
and calls displaySearchResults to list down the search
results*/
function searchMovie(){
	
	var xhr = new XMLHttpRequest();
	var searchValue = document.getElementById("searchBox").value;
	if(searchValue === '')
	{
	   alert('Please enter a value to search.');
	   return;
	}
	var query = encodeURI(searchValue);
	xhr.open("GET", "proxy.php?method=/3/search/movie&query=" + query);
	xhr.setRequestHeader("Accept","application/json");
	xhr.onreadystatechange = function(){
	   if (this.readyState == 4) {
		  var json = JSON.parse(this.responseText);
		  displaySearchResults(json);
	   }
	};
	xhr.send(null);
}

function displaySearchResults(searchData){
	
	var outputEl = document.getElementById('searchResultWindow');
	var searchContent = '<ul class="circle">';
	var results = searchData.results;
	var movieId, releaseDate;
	if(results.length < 1)
	{
		searchContent += '<li><b>No matching results found.</b></li>' 
	}
	else
	{
		results.forEach(function(entry){
			movieId = entry.id;
			releaseDate = new Date(entry.release_date);
			searchContent += '<li><a href="javascript:getMovieDetails('+ movieId +');">' 
			searchContent += entry.original_title + '</a>&nbsp;&nbsp;(' + releaseDate.getFullYear() + ')</li>';
		});
	}
	searchContent += '</ul>';
	outputEl.innerHTML = searchContent;
}

/*Calls TMDb API through proxy to get details of a given
movie id and calls getCreditDetails() to get the cast details*/
function getMovieDetails(movieId) {
	
   var xhr = new XMLHttpRequest();
   var encodedMovieId = encodeURI(movieId);
   xhr.open("GET", "proxy.php?method=/3/movie/" + encodedMovieId);
   xhr.setRequestHeader("Accept","application/json");
   xhr.onreadystatechange = function () {
       if (this.readyState == 4) {
          var json = JSON.parse(this.responseText);
		  getCreditDetails(json);
       }
   };
   xhr.send(null);
}

/*Calls TMDb API through proxy to get cast details of a given
movie id and calls displayMovieDetails() to show the movie 
and cast details*/
function getCreditDetails(movieData) {
	
	var xhr = new XMLHttpRequest();
	var encodedMovieId = encodeURI(movieData.id);
	xhr.open("GET", "proxy.php?method=/3/movie/" + encodedMovieId + "/credits");
	xhr.setRequestHeader("Accept","application/json");
	xhr.onreadystatechange = function () {
	   if (this.readyState == 4) {
		  var json = JSON.parse(this.responseText);
		  displayMovieDetails(movieData, json);
	   }
	};
	xhr.send(null);
}

function displayMovieDetails(movieData, creditDetails){
	
	var outputEl = document.getElementById('movieInfoWindow');
	var posterURL = baseImageURL + '/' + movieData.poster_path;
	var genres = '';
	var counter = 0;
	var creditList = '<ul class="circle">';
	movieData.genres.forEach(function(genre){
		genres += genre.name;
		if(++counter < movieData.genres.length){
			genres += ', ';
		}
	});
	for(counter = 0; counter < castSize; counter++){
		if(counter >= creditDetails.cast.length){
			break;
		}
		creditList += '<li>' +creditDetails.cast[counter].name+ '&nbsp;&nbsp;('+ creditDetails.cast[counter].character +')</li>';
	}
	creditList += '</ul>';
	
	var movieInfo = '<table cellspacing="0" cellpadding="0" border="0"><tbody><tr><td><img class="float" src="'+ posterURL +'"/>';
	movieInfo += '<span class="title">'+ movieData.original_title +'</span>';
	movieInfo += '<br/><br/><b>Genres: </b>' + genres + '</td></tr>';
	movieInfo += '<tr><td><br/><b>Summary: </b><br/>' + movieData.overview + '</td></tr>';
	movieInfo += '<tr><td><br/><b>Cast: </b>' + creditList + '</td></tr>';
	movieInfo += '</tbody></table>';
	outputEl.innerHTML = movieInfo;
}
