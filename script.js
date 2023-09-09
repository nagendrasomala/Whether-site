document.addEventListener("DOMContentLoaded", () => {


    

const cityinput = document.querySelector(".city-input");
const searchbutton = document.querySelector("#search");
const locationbutton = document.querySelector(".location-btn");
const weatherCardsDiv = document.querySelector(".whether-cards");
const currentweatherDiv = document.querySelector(".current-weather");
const bodyElement = document.body;
const API_KEY = "5ceaf95d1ccb55e279e9d29ae3f26121";

function isDaytime() {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 6 && hours < 18; 
  }

  function sumtime(timestamp){
                    const date = new Date(timestamp * 1000); 
                    const hours = date.getHours();
                    const amOrPm = hours >= 12 ? 'PM' : 'AM';
                    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0'); // Ensure two digits with leading zeros
                    const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two digits with leading zeros

                    return `${formattedHours}:${minutes} ${amOrPm}`;
  }
const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        const des = weatherItem.weather[0].description;
        if (des.includes("rain")&&!isDaytime()) {
            bodyElement.style.backgroundImage = "url('thunder.jpg')"; 
          } 
          else if(des.includes("sky")||isDaytime()) {
            bodyElement.style.backgroundImage = "url('day.jpg')"; 
          }
          else if(des.includes("clouds")&&!isDaytime()) {
            bodyElement.style.backgroundImage = "url('nightcloudy.jpg')"; 
          }

          document.querySelector("#min").innerHTML= "Min-Temp : "+ (weatherItem.main.temp_min - 273.15).toFixed(2) +"⁰C";
          document.querySelector("#max").innerHTML= "Max-Temp : "+ (weatherItem.main.temp_max - 273.15).toFixed(2) +"⁰C";
          document.querySelector("#sea").innerHTML= "Sea-Level : "+ (weatherItem.main.sea_level/1000).toFixed(2) +"Km";



         
         
        return `
            <div class="details">
                <h2>  ${weatherItem.dt_txt.split(" ")[0]} </h2>
                <h2>${cityName}</h2>
                <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)} ⁰C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/s</h4>
                <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                <h4>Pressure: ${weatherItem.main.pressure} hPa</h4>
                
            </div>
            <div class="icon">
                <h4   id="temp">${(weatherItem.main.temp - 273.15).toFixed(2)} ⁰C</h4>
                <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                <h3>${weatherItem.weather[0].description}</h3>
            </div>
        `;
    } else {
        return `<li class="card">
            <h3> ${weatherItem.dt_txt.split(" ")[0]} </h3>
            <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
            <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)} C</h4>
            <h4>Wind: ${weatherItem.wind.speed} M/s</h4>
            <h4>Humidity: ${weatherItem.main.humidity} %</h4>
            <h4>${weatherItem.weather[0].description}</h4>
          


        </li>`;
    }
    
};

const getWetherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    
    
    fetch(WEATHER_API_URL)
        .then((res) => {
            if (!res.ok) {
                throw new Error("Network response was not ok");
            }
            return res.json();
        })
        .then((data) => {
            const uniqueForecastDays = [];
            console.log(data);
            
            const sixDaysForecast = data.list.filter((forecast) => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            cityinput.value = "";
            weatherCardsDiv.innerHTML = "";
            currentweatherDiv.innerHTML = "";
            sixDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentweatherDiv.innerHTML = createWeatherCard(cityName, weatherItem, index);
                                        
                    document.querySelector(".srise").innerHTML= sumtime(data.city.sunrise);
                    document.querySelector(".sset").innerHTML= sumtime(data.city.sunset);


                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
        })
        .catch((error) => {
            console.error("An error occurred:", error);
            alert("An error occurred while fetching weather data.");
        });
};


const getCityCoordinates = () => {
    const cityName = cityinput.value.trim();
    if(!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data =>{
         if(!data.length) return alert("an alert occured");
         const {name,lat,lon} = data[0];
         getWetherDetails(name,lat,lon);
    }).catch(()=>{
        alert("An error occured");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position =>{
            const {latitude,longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data =>{
                if(!data.length) return alert("an alert occured");
                const {name} = data[0];
                getWetherDetails(name,latitude,longitude);
           }).catch(()=>{
               alert("An error occured in fetching city");
           });
        },error=>{
            if(error.code===error.PERMISSION_DENIED){
                alert("Give Location access")
            }
        }
    )
}




const smallCircle = document.getElementById("smallCircle");
const semicircle = document.querySelector(".semicircle");

let isDragging = false;

smallCircle.addEventListener("mousedown", (e) => {
  isDragging = true;
  smallCircle.style.transition = "none";
  moveSmallCircle(e);
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    moveSmallCircle(e);
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  smallCircle.style.transition = "transform 0.5s ease-in-out";
});

function moveSmallCircle(e) {
  const semicircleRect = semicircle.getBoundingClientRect();
  const offsetX = e.clientX - semicircleRect.left;
  const offsetY = e.clientY - semicircleRect.top;

  const angle = (Math.atan2(offsetY, offsetX) * 180) / Math.PI;

  // Adjust for the initial rotation of the semicircle
  const adjustedAngle = angle - 90;

  // Limit the angle to be within the semicircle
  const limitedAngle = Math.min(Math.max(adjustedAngle, 0), 180);

  smallCircle.style.transform = `translateX(-50%) rotate(${limitedAngle}deg)`;
}











searchbutton.addEventListener('click', getCityCoordinates);
locationbutton.addEventListener('click', getUserCoordinates);
getUserCoordinates();

});
