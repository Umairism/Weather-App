import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import axios from 'axios';
import '../index.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [detailedWeatherData, setDetailedWeatherData] = useState(null);

  const apiKey = '30ab2e72538d0f2ebe35be09037aaa32';
  const baseURL = 'https://api.openweathermap.org/data/2.5/weather';
  const searchURL = 'https://api.openweathermap.org/data/2.5/find';

  useEffect(() => {
    const fetchWeather = async () => {
      if (city === '') return;
      
      setLoading(true);

      try {
        const response = await fetch(`${baseURL}?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        if (response.ok) {
          console.log('Weather data:', data); // Debugging statement
          setWeatherData(data);

          // Fetch detailed weather data using the forecast endpoint
          const detailedResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apiKey}&units=metric`);
          const detailedData = await detailedResponse.json();
          if (detailedResponse.ok) {
            console.log('Detailed weather data:', detailedData); // Debugging statement
            setDetailedWeatherData(detailedData);
          } else {
            console.error('Error fetching detailed weather data:', detailedData);
            setDetailedWeatherData(null);
          }
        } else {
          console.error('Error fetching weather data:', data);
          setWeatherData(null);
          setDetailedWeatherData(null);
          setError('Error fetching weather data, City not found');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setLoading(false);
        setError('Error fetching weather data, City not found');
        setWeatherData(null);
        setDetailedWeatherData(null);
      }
    };
    
    fetchWeather();
  }, [city]);

  const handleCityChange = async (event) => {
    const inputValue = event.target.value;
    console.log('City input:', inputValue); // Debugging statement
    setCity(inputValue);
    
    if (inputValue.length > 2) {
      try {
        const response = await fetch(`${searchURL}?q=${inputValue}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        if (response.ok) {
          console.log('Suggestions:', data.list); // Debugging statement
          setSuggestions(data.list);
        } else {
          console.error('Error fetching suggestions:', data);
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.name);
    setSuggestions([]);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      setActiveSuggestionIndex((prev) =>
        Math.min(prev + 1, suggestions.length - 1)
      );
    } else if (event.key === 'ArrowUp') {
      setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter') {
      const selectedSuggestion = suggestions[activeSuggestionIndex];
      if (selectedSuggestion) {
        setCity(selectedSuggestion.name);
        setSuggestions([]);
      }
    }
  };

  const getBackgroundVideo = () => {
    if (!weatherData) return '/videos/clear.mp4';

    const weatherCondition = weatherData.weather[0].main.toLowerCase();

    if (weatherCondition === 'rain') return '/videos/rain.mp4';
    if (weatherCondition === 'snow') return '/videos/snow.mp4';
    if (weatherCondition === 'clouds') return '/videos/clouds.mp4';
    if (weatherCondition === 'clear sky') return '/videos/clear.mp4';
    if (weatherCondition === 'thunderstorm') return '/videos/thunderstorm.mp4';
    if (weatherCondition === 'mist' || weatherCondition === 'fog') return '/videos/fog.mp4';

    return '/videos/clear.mp4';
  };

  return (
    <div className="Weather-Cont">
      {/* Background Video */}
      <video
        className="background-video"
        autoPlay
        loop
        muted
        src={getBackgroundVideo()}
      ></video>

      <div className="weather-content">
        <input
          type="text"
          placeholder="Enter Your City"
          value={city}
          onChange={handleCityChange}
          onKeyDown={handleKeyDown}
        />
        
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Loading...</div>}
        
        {/* Display suggestions */}
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className={index === activeSuggestionIndex ? 'active' : ''}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.name}, {suggestion.sys.country}
              </li>
            ))}
          </ul>
        )}

        {/* Display weather data */}
        {weatherData ? (
          <div>
            <h1>
              {weatherData.name}, {weatherData.sys.country}
            </h1>
            <p>{weatherData.weather[0].description}</p>
            <p>{weatherData.main.temp}°C</p>

            {/* Map */}
          <MapContainer
            center={[weatherData.coord.lat, weatherData.coord.lon]} // Coordinates from weatherData
            zoom={10}
            style={{ width: '100%', height: '400px' }} // Customize map dimensions
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // Tile layer from OpenStreetMap
            />
            <Marker
              position={[weatherData.coord.lat, weatherData.coord.lon]}
              icon={L.icon({ iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Red_dot.svg', iconSize: [15, 15] })}
            >
              <Popup>
                {weatherData.name}, {weatherData.sys.country}
              </Popup>
            </Marker>
          </MapContainer>

            {/* Detailed Weather Information */}
            {detailedWeatherData && detailedWeatherData.list && (
              <div className="detailed-weather">
                <div className="weather-info">
                  <h2>Weather Information</h2>
                  <p>Feels Like: {detailedWeatherData.list[0].main.feels_like}°C</p>
                  <p>Humidity: {detailedWeatherData.list[0].main.humidity}%</p>
                  <p>Wind Speed: {detailedWeatherData.list[0].wind.speed} m/s</p>
                  <p>Wind Direction: {detailedWeatherData.list[0].wind.deg}°</p>
                  <p>UV Index: {detailedWeatherData.list[0].uvi}</p>
                </div>
                <div className="weather-forecast">
                  <h2>Weather Forecast</h2>
                  <ul>
                    {detailedWeatherData.list.slice(0, 24).map((hour, index) => (
                      <li key={index}>
                        {new Date(hour.dt * 1000).getHours()}:00 - {hour.main.temp}°C, {hour.weather[0].description}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>Start typing a city...</p>
        )}
      </div>
    </div>
  );
};

export default Weather;
