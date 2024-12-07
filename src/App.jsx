import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { WiDaySunny, WiRain, WiCloudy, WiSnow, WiThunderstorm } from 'react-icons/wi'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '4b945adf6a248bc416534f1601318157'
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

const popularCities = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Челябинск',
  'Самара',
  'Уфа',
  'Ростов-на-Дону'
]

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showCityList, setShowCityList] = useState(false)
  const [filteredCities, setFilteredCities] = useState([])

  useEffect(() => {
    if (city.trim()) {
      const filtered = popularCities.filter(c => 
        c.toLowerCase().includes(city.toLowerCase())
      )
      setFilteredCities(filtered)
      setShowCityList(filtered.length > 0)
    } else {
      setFilteredCities([])
      setShowCityList(false)
    }
  }, [city])

  const getWeatherIcon = (code) => {
    if (code >= 200 && code < 300) return <WiThunderstorm className="w-20 h-20" />
    if (code >= 300 && code < 600) return <WiRain className="w-20 h-20" />
    if (code >= 600 && code < 700) return <WiSnow className="w-20 h-20" />
    if (code >= 700 && code < 800) return <WiCloudy className="w-20 h-20" />
    return <WiDaySunny className="w-20 h-20" />
  }

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) return

    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=ru`)
      setWeather(response.data)
      setShowCityList(false)
    } catch (err) {
      setError('Город не найден. Пожалуйста, проверьте название.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchWeather(city)
  }

  const handleCityClick = (cityName) => {
    setCity(cityName)
    fetchWeather(cityName)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Погодное приложение</h1>
          <p className="text-lg text-gray-300">Узнайте погоду в любом городе мира</p>
        </motion.div>

        <div className="relative max-w-md mx-auto mb-8">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Введите название города..."
              className="input-field pr-12 w-full text-lg"
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors"
              disabled={loading}
            >
              <MagnifyingGlassIcon className="w-6 h-6 text-white" />
            </button>
          </form>

          {showCityList && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-10 w-full mt-2 bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden shadow-xl"
            >
              <ul className="max-h-60 overflow-y-auto">
                {filteredCities.map((cityName, index) => (
                  <motion.li
                    key={cityName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleCityClick(cityName)}
                    className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors text-white flex items-center space-x-3"
                  >
                    <span className="text-accent">{index + 1}</span>
                    <span>{cityName}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 text-red-100 p-4 rounded-lg mb-8 max-w-md mx-auto"
          >
            {error}
          </motion.div>
        )}

        {weather && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="weather-card max-w-md mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{weather.name}</h2>
                <p className="text-gray-300">{weather.sys.country}</p>
              </div>
              {getWeatherIcon(weather.weather[0].id)}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-4xl font-bold">{Math.round(weather.main.temp)}°C</p>
                <p className="text-gray-300">Температура</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-4xl font-bold">{weather.main.humidity}%</p>
                <p className="text-gray-300">Влажность</p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-lg capitalize">{weather.weather[0].description}</p>
              <div className="flex justify-between mt-4 text-sm text-gray-300">
                <span>Мин: {Math.round(weather.main.temp_min)}°C</span>
                <span>Макс: {Math.round(weather.main.temp_max)}°C</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default App
