console.log("I am okay.. ");
const ApiUrl = "http://api.weatherapi.com/v1/current.json?&q=" ;
const ApiKey = "c51a68b5a56945d0b7f64550242508" ;

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search Button");
const weatherIcon = document.querySelector(".weather-icon");

async function checkWeather(city)
{
   const response = await fetch (ApiUrl + city +`&key= ${ApiKey}`);

   if (response.status == 400) {
    document.querySelector(".error").style.display = "block";
    document.querySelector(".weather-detials").style.display = "none";
   } else 
 {
    var data = await response.json();
    console.log(data);
 
    document.querySelector(".city").innerHTML = data.location.name;
    document.querySelector(".temp").innerHTML = Math.round(data.current.temp_c) + "°C";
    document.querySelector(".wind-speed").innerHTML = data.current.wind_kph  + " km/h";
    document.querySelector(".humidity-per").innerHTML =data.current.humidity  + "%" ;
 
    if(data.current.condition.text == "Cloud")
     {
       weatherIcon.src = "images/clouds.png"
     } 
    else if(data.current.condition.text == "Mist")
     {
       weatherIcon.src = "images/mist.png"
     }
    else if(data.current.condition.text == "Sunny")
     {
       weatherIcon.src = "images/clear.png"
     }
    else if(data.current.condition.text == "Rain")
     {
        weatherIcon.src = "images/rain.png"
     }
    else if(data.current.condition.text == "Drizzle")
     {
        weatherIcon.src = "images/drizzle.png"
     }
    else if(data.current.condition.text == "Partly cloudy")
     {
         weatherIcon.src = "images/cloudy.png"
     }
     else if(data.current.condition.text == "Torrential rain shower")
     {
         weatherIcon.src = "images/raiiny.png"
     }
     else if(data.current.condition.text == "Clear")
     {
          weatherIcon.src = "images/sunny.png"
     }
     else if(data.current.condition.text == "Patchy rain nearby")
     {
 
         weatherIcon.src = "images/clouds.png"
     }
 
     document.querySelector(".weather-detials").style.display = "block" ;
    //  document.querySelector(".error").style.display = "none";
    }
 
}

   
searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});
