import axios from "axios";

//TOOLS
async function getWeatherData(palce) {
  const url = `https://wttr.in/${palce.toLowerCase()}?format=%C+%t`;
  const response = await axios.get(url, { responseType: "text" });
  return JSON.stringify({ palce, weatherInfo: response.data });
}

export { getWeatherData };
