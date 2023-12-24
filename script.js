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
        const { temp, humidity } = data.main;
        const { speed }  = data.wind;
        document.querySelector(".city").innerText = "Weather in "+name;
        document.querySelector(".icon").src = "https://openweathermap.org/img/wn/" + icon + ".png";
        document.querySelector(".description").innerText = description;
        document.querySelector(".temp").innerText = temp + "°C";
        document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
        document.querySelector(".wind").innerText = "Wind Speed: " + speed + " km/hr";
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

weather.fetchWeather("Denver");

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