let weather = {
    apikey: "78add9bb3f7268c796fba3d1adfb0521",
    fetchWeather: function(city) {
        fetch("https://api.openweathermap.org/data/2.5/weather?q=" 
        + city 
        +"&units=metric&appid=" 
        + this.apikey
        )
        .then((Response) => {
            if (!Response.ok) {
                alert("No weather found!!");
                throw new Error("No weather found!!");
            }
         return Response.json()
        })
        .then((data) => this.displayWeather(data));
    },

    displayWeather: function(data) {
        const { name } = data;
        const { icon, description } = data.weather[0];
        const { temp, feels_like, humidity } = data.main;
        // add feels-like 
        const { speed }  = data.wind;
        document.querySelector(".city").innerText = "Weather in "+name;
        document.querySelector(".icon").src = "https://openweathermap.org/img/wn/" + icon + ".png";
        document.querySelector(".description").innerText = description;
        document.querySelector(".temp").innerText = temp + "°C";
        document.querySelector(".feels-like").innerText = "Feels Like: " + feels_like + "°C";
        document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
        document.querySelector(".wind").innerText = "Wind Speed: " + speed + " m/s";
        document.querySelector(".weather").classList.remove("loading");
        document.body.style.backgroundImage = "url('https://source.unsplash.com/1600x900/?" + name + "')";
    },

    search: function () {
        this.fetchWeather(document.querySelector(".search-bar").value);
        this.fetchForecast(document.querySelector(".search-bar").value);
    }
};  

document.querySelector(".search button").addEventListener("click", function () {
    weather.search();
}); 

document.querySelector(".search-bar").addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        weather.search();
    }
});

// default weather display
weather.fetchWeather("Sydney");

//////////////////////////////////////////////////////
// fetching the forecast
weather.fetchForecast = function(city) {
    fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=metric&appid=" + this.apikey)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch forecast");
            }
            return response.json();
        })
        .then(data => {
            console.log("API Response for Forecast:", data); 
            this.displayForecast(data);
        })
        .catch(error => console.error("Error fetching forecast:", error));
};

// displaying the forecast

weather.displayForecast = function(data) {
    const dailyForecasts = data.list;
    const uniqueDays = {};
  
    dailyForecasts.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "short" });
  
      if (!uniqueDays[day]) {
        uniqueDays[day] = {
          icon: forecast.weather[0].icon,
          temp: forecast.main.temp
        };
      }
    });
  
    const forecastContainer = document.querySelector(".forecast .forecast-container");
    forecastContainer.innerHTML = ""; // Clear previous content
  
    for (const [day, { icon, temp }] of Object.entries(uniqueDays)) {
      const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
      const forecastElement = `
        <div class="forecast-item">
          <img src="${iconUrl}" alt="${day} icon">
          <span class="day">${day}</span>
          <span class="temp">${temp}°C</span>
        </div>
      `;
      forecastContainer.insertAdjacentHTML('beforeend', forecastElement);
    }
  };

weather.fetchForecast("Sydney");

///////////////////////////////////////////////////////
// functionality for saving favourite cities
function addToFavorites(city) {
    let savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];

    const existingLocation = savedLocations.find(location => location.city === city);
    if (existingLocation) {
        alert('City already added to favorites!');
        return;
    }

    savedLocations.push({ city });
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    displaySavedLocations();
    weather.fetchForecast(city);
    document.querySelector('.search-bar').value = city;

}

function displaySavedLocations() {
    let savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];

    const savedLocationsList = document.querySelector('.saved-locations');
    savedLocationsList.innerHTML = '';

    savedLocations.forEach(location => {
        const listItem = document.createElement('li');
        listItem.textContent = location.city;
        listItem.classList.add('saved-location');

        listItem.addEventListener('click', () => {
            weather.fetchWeather(location.city);
            weather.fetchForecast(location.city);
            document.querySelector('.search-bar').value = location.city;
        });

        savedLocationsList.appendChild(listItem);
    });
}

// Event listener for "Add to Favorites" button (if available)
document.querySelector(".add-to-favourites").addEventListener("click", function () {
    const city = document.querySelector(".city").innerText.replace("Weather in ", "");;
    addToFavorites(city);
    displaySavedLocations();
});

// Initial display of saved locations when the app loads
displaySavedLocations();

////////////////////////////////////////////////////////
// Function to handle the click event for saved locations
function handleCitySelection(cityItem) {
    const allCityItems = document.querySelectorAll('.saved-location');

    // Remove the 'active' class from all city items
    allCityItems.forEach(item => {
        item.classList.remove('active');
    });

    // Add the 'active' class to the clicked city item
    cityItem.classList.add('active');
}

// Event listener for saved locations
document.addEventListener('DOMContentLoaded', () => {
    const allCityItems = document.querySelectorAll('.saved-location');

    allCityItems.forEach(cityItem => {
        cityItem.addEventListener('click', function () {
            handleCitySelection(cityItem);

            const cityName = cityItem.textContent;
            weather.fetchWeather(cityName);
            weather.fetchForecast(cityName);
            document.querySelector('.search-bar').value = cityName;
        });
    });
});

// Function to clear all saved favorites
function clearFavorites() {
    localStorage.removeItem('savedLocations');
    displaySavedLocations(); // Refresh the displayed list
}

// Event listener for the "Clear Favorites" button
document.querySelector('.clear-favorites').addEventListener('click', clearFavorites);