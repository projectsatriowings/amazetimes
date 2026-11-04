/**
 * Real-Time Weather Service for Tamil Nadu
 * Powered by Open-Meteo (Accurate, Real-Time, Free Open Meteorological API)
 */

export const TAMIL_NADU_CITIES = [
  { id: 'chennai', name_ta: 'சென்னை', name_en: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { id: 'madurai', name_ta: 'மதுரை', name_en: 'Madurai', lat: 9.9252, lon: 78.1198 },
  { id: 'coimbatore', name_ta: 'கோயம்புத்தூர்', name_en: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
  { id: 'trichy', name_ta: 'திருச்சி', name_en: 'Trichy', lat: 10.7905, lon: 78.7047 },
  { id: 'salem', name_ta: 'சேலம்', name_en: 'Salem', lat: 11.6643, lon: 78.1460 },
  { id: 'tirunelveli', name_ta: 'திருநெல்வேலி', name_en: 'Tirunelveli', lat: 8.7139, lon: 77.7567 }
];

export const getWeatherDescription = (code) => {
  if (code === 0) return { text: 'தெளிவான வானம்', en: 'Clear Sky', icon: 'sun', bg: 'from-amber-500 to-orange-500' };
  if (code === 1 || code === 2) return { text: 'மிதமான வெயில் & மேகம்', en: 'Partly Cloudy', icon: 'cloud-sun', bg: 'from-sky-500 to-blue-600' };
  if (code === 3) return { text: 'மேகமூட்டம்', en: 'Overcast', icon: 'cloud', bg: 'from-slate-600 to-slate-800' };
  if (code === 45 || code === 48) return { text: 'பனிமூட்டம்', en: 'Foggy', icon: 'cloud-fog', bg: 'from-slate-500 to-slate-700' };
  if (code >= 51 && code <= 55) return { text: 'தூறல் மழை', en: 'Drizzle', icon: 'cloud-drizzle', bg: 'from-blue-600 to-indigo-700' };
  if (code >= 61 && code <= 65) return { text: 'மழைப் பொழிவு', en: 'Rain', icon: 'cloud-rain', bg: 'from-blue-700 to-indigo-900' };
  if (code >= 80 && code <= 82) return { text: 'கனமழை வாய்ப்பு', en: 'Heavy Showers', icon: 'cloud-rain', bg: 'from-blue-800 to-indigo-950' };
  if (code >= 95) return { text: 'இடி மின்னலுடன் மழை', en: 'Thunderstorm', icon: 'cloud-lightning', bg: 'from-purple-800 to-slate-900' };
  return { text: 'மிதமான வானிலை', en: 'Pleasant', icon: 'sun', bg: 'from-amber-500 to-sky-600' };
};

// Fallback data in case client is completely offline
const FALLBACK_WEATHER = [
  { id: 'chennai', name_ta: 'சென்னை', name_en: 'Chennai', temp: 31, feelsLike: 37, humidity: 72, wind: 5.2, condition: 'மேகமூட்டம்', conditionEn: 'Partly Cloudy', icon: 'cloud-sun', rainChance: 15 },
  { id: 'madurai', name_ta: 'மதுரை', name_en: 'Madurai', temp: 32, feelsLike: 38, humidity: 58, wind: 4.1, condition: 'தெளிவான வானம்', conditionEn: 'Sunny', icon: 'sun', rainChance: 5 },
  { id: 'coimbatore', name_ta: 'கோயம்புத்தூர்', name_en: 'Coimbatore', temp: 29, feelsLike: 33, humidity: 55, wind: 4.8, condition: 'இதமான வானிலை', conditionEn: 'Pleasant', icon: 'cloud-sun', rainChance: 10 },
  { id: 'trichy', name_ta: 'திருச்சி', name_en: 'Trichy', temp: 32, feelsLike: 39, humidity: 65, wind: 3.5, condition: 'மேகமூட்டம்', conditionEn: 'Overcast', icon: 'cloud', rainChance: 20 },
  { id: 'salem', name_ta: 'சேலம்', name_en: 'Salem', temp: 30, feelsLike: 35, humidity: 60, wind: 3.9, condition: 'மிதமான வெயில்', conditionEn: 'Partly Sunny', icon: 'cloud-sun', rainChance: 10 },
  { id: 'tirunelveli', name_ta: 'திருநெல்வேலி', name_en: 'Tirunelveli', temp: 33, feelsLike: 39, humidity: 56, wind: 4.0, condition: 'தெளிவான வானம்', conditionEn: 'Sunny', icon: 'sun', rainChance: 5 }
];

let cachedWeatherData = null;
let lastFetchTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

export const fetchRealtimeWeather = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedWeatherData && (now - lastFetchTime < CACHE_TTL)) {
    return cachedWeatherData;
  }

  try {
    const lats = TAMIL_NADU_CITIES.map(c => c.lat).join(',');
    const lons = TAMIL_NADU_CITIES.map(c => c.lon).join(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);

    const data = await res.json();
    const resultsArray = Array.isArray(data) ? data : [data];

    const weatherList = resultsArray.map((item, idx) => {
      const city = TAMIL_NADU_CITIES[idx] || TAMIL_NADU_CITIES[0];
      const cur = item.current || {};
      const cond = getWeatherDescription(cur.weather_code ?? 0);

      return {
        id: city.id,
        name_ta: city.name_ta,
        name_en: city.name_en,
        temp: Math.round(cur.temperature_2m ?? 30),
        feelsLike: Math.round(cur.apparent_temperature ?? cur.temperature_2m ?? 30),
        humidity: Math.round(cur.relative_humidity_2m ?? 65),
        wind: Number(cur.wind_speed_10m ?? 4.0).toFixed(1),
        precipitation: Number(cur.precipitation ?? 0).toFixed(1),
        weatherCode: cur.weather_code ?? 0,
        condition: cond.text,
        conditionEn: cond.en,
        icon: cond.icon,
        gradient: cond.bg,
        updatedAt: new Date().toLocaleTimeString('ta-IN', { hour: '2-digit', minute: '2-digit' })
      };
    });

    cachedWeatherData = weatherList;
    lastFetchTime = now;
    return weatherList;
  } catch (err) {
    console.warn('Realtime weather fetch error, using cached/fallback:', err?.message || err);
    return cachedWeatherData || FALLBACK_WEATHER;
  }
};

