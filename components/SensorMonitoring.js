import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  RefreshControl,
  Alert 
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { database, ref, get, child } from '../components/firebaseConfig.js';

// OPCIÓN 1: Open-Meteo (100% GRATUITO, SIN API KEY)
//const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

// OPCIÓN 2: WeatherAPI (Gratuito hasta 1M llamadas/mes)
const WEATHER_API_KEY = '1daaa3e0460347c2bfe185832252205';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1/current.json';

// OPCIÓN 3: OpenWeatherMap (Gratuito hasta 1000 llamadas/día)
// const WEATHER_API_KEY = 'TU_API_KEY_OPENWEATHER';
// const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Componente para mostrar las condiciones climáticas locales
const WeatherCard = ({ weatherData }) => {
  if (!weatherData) return null;

  return (
    <View style={styles.weatherCard}>
      <Text style={styles.weatherTitle}>Condiciones Climáticas Locales</Text>
      <View style={styles.weatherRow}>
        <Ionicons name="thermometer" size={20} color="#ff6b6b" />
        <Text style={styles.weatherText}>
          Temperatura: {Math.round(weatherData.main.temp)}°C
        </Text>
      </View>
      <View style={styles.weatherRow}>
        <Ionicons name="water" size={20} color="#4ecdc4" />
        <Text style={styles.weatherText}>
          Humedad: {weatherData.main.humidity}%
        </Text>
      </View>
      <View style={styles.weatherRow}>
        <Ionicons name="eye" size={20} color="#45b7d1" />
        <Text style={styles.weatherText}>
          Presión: {weatherData.main.pressure} hPa
        </Text>
      </View>
      <View style={styles.weatherRow}>
        <Ionicons name="speedometer" size={20} color="#96ceb4" />
        <Text style={styles.weatherText}>
          Viento: {weatherData.wind.speed} m/s
        </Text>
      </View>
      <View style={styles.weatherRow}>
        <Ionicons name="cloud" size={20} color="#feca57" />
        <Text style={styles.weatherText}>
          Condición: {weatherData.weather[0].description}
        </Text>
      </View>
      <Text style={styles.weatherLocation}>
        📍 {weatherData.name}, {weatherData.sys.country}
      </Text>
    </View>
  );
};

// Componente para mostrar los detalles de un sensor específico
const SensorDetailsModal = ({ visible, sensor, onClose, weatherData }) => {
  return (
    <Modal 
      animationType="slide" 
      transparent={true} 
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Detalles del Sensor</Text>
          <ScrollView showsVerticalScrollIndicator={true}>
            <Text style={styles.detailText}>ID: {sensor.id}</Text>
            <Text style={styles.detailText}>Temperatura: {sensor.temperature}°C</Text>
            <Text style={styles.detailText}>Humedad: {sensor.humidity}%</Text>
            <Text style={styles.detailText}>
              Ubicación: {sensor.location.latitude.toFixed(6)}, {sensor.location.longitude.toFixed(6)}
            </Text>
            <Text style={styles.detailText}>
              Fecha: {new Date(sensor.timestamp).toLocaleString()}
            </Text>
            
            {weatherData && (
              <>
                <Text style={styles.detailTitle}>Comparación con Clima Local:</Text>
                <Text style={styles.comparisonText}>
                  Diferencia Temp: {Math.abs(sensor.temperature - weatherData.main.temp).toFixed(1)}°C
                </Text>
                <Text style={styles.comparisonText}>
                  Diferencia Humedad: {Math.abs(sensor.humidity - weatherData.main.humidity)}%
                </Text>
              </>
            )}
          </ScrollView>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Componente principal de monitoreo de sensores
const SensorMonitoring = () => {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // OPCIÓN 1: Open-Meteo (COMPLETAMENTE GRATUITO - SIN API KEY)
  /*
  const fetchWeatherData = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `${OPEN_METEO_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,surface_pressure,windspeed_10m&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error('Error al obtener datos climáticos');
      }
      
      const data = await response.json();
      
      // Formatear datos para que coincidan con el formato esperado
      const formattedData = {
        main: {
          temp: data.current_weather.temperature,
          humidity: data.hourly.relativehumidity_2m[0],
          pressure: data.hourly.surface_pressure[0]
        },
        wind: {
          speed: data.current_weather.windspeed
        },
        weather: [{
          description: getWeatherDescription(data.current_weather.weathercode)
        }],
        name: 'Tu Ubicación',
        sys: {
          country: 'Local'
        }
      };
      
      setWeatherData(formattedData);
    } catch (error) {
      console.error('Error al obtener clima:', error);
      Alert.alert('Error', 'No se pudieron obtener las condiciones climáticas');
    }
  };
*/
  // OPCIÓN 2: WeatherAPI (Alternativa con registro gratuito)
  
  const fetchWeatherDataWeatherAPI = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&lang=es`
      );
      
      const data = await response.json();
      
      const formattedData = {
        main: {
          temp: data.current.temp_c,
          humidity: data.current.humidity,
          pressure: data.current.pressure_mb
        },
        wind: {
          speed: data.current.wind_kph / 3.6 // convertir km/h a m/s
        },
        weather: [{
          description: data.current.condition.text
        }],
        name: data.location.name,
        sys: {
          country: data.location.country
        }
      };
      
      setWeatherData(formattedData);
    } catch (error) {
      console.error('Error al obtener clima:', error);
    }
  };
  

  // Función para convertir códigos de clima de Open-Meteo a descripción
  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: 'Despejado',
      1: 'Principalmente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Niebla',
      48: 'Niebla con escarcha',
      51: 'Llovizna ligera',
      53: 'Llovizna moderada',
      55: 'Llovizna densa',
      56: 'Llovizna helada ligera',
      57: 'Llovizna helada densa',
      61: 'Lluvia ligera',
      63: 'Lluvia moderada',
      65: 'Lluvia fuerte',
      66: 'Lluvia helada ligera',
      67: 'Lluvia helada fuerte',
      71: 'Nieve ligera',
      73: 'Nieve moderada',
      75: 'Nieve fuerte',
      77: 'Granizo',
      80: 'Chubascos ligeros',
      81: 'Chubascos moderados',
      82: 'Chubascos fuertes',
      85: 'Chubascos de nieve ligeros',
      86: 'Chubascos de nieve fuertes',
      95: 'Tormenta',
      96: 'Tormenta con granizo ligero',
      99: 'Tormenta con granizo fuerte'
    };
    return weatherCodes[code] || 'Desconocido';
  };

  // Simular datos de sensores (reemplazar con datos reales de ESP32)
  const fetchSensorData = async () => {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, '/'));
  
      if (snapshot.exists()) {
        const data = snapshot.val();
  
        // Puedes adaptar este formato si tus datos tienen geolocalización
        const sensorData = [
          {
            id: 'Sensores',
            temperature: data.temperatura,
            humidity: data.humedad,
            timestamp: Date.now(),
            location: {
              latitude: 2.449515,     // usa coordenadas reales si tienes
              longitude: -76.599592
            }
          }
        ];
  
        setSensors(sensorData);
      } else {
        console.log("No hay datos disponibles.");
      }
    } catch (error) {
      console.error("Error al obtener datos de Firebase:", error);
    }
  };

  // Obtener ubicación del usuario
  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Requerido', 'Se necesita acceso a la ubicación para obtener datos climáticos');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      
      setUserLocation(coords);
      
      // Obtener datos climáticos para la ubicación actual
      await fetchWeatherDataWeatherAPI(coords.latitude, coords.longitude);
      
    } catch (error) {
      console.error('Error al obtener ubicación', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
    }
  };

  // Función para refrescar todos los datos
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchSensorData(),
      getUserLocation()
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSensorData();
    getUserLocation();
    
    // Actualizar datos periódicamente (cada 5 minutos para el clima)
    const sensorInterval = setInterval(fetchSensorData, 5000);
    const weatherInterval = setInterval(() => {
      if (userLocation) {
        fetchWeatherData(userLocation.latitude, userLocation.longitude);
      }
    }, 300000); // 5 minutos

    return () => {
      clearInterval(sensorInterval);
      clearInterval(weatherInterval);
    };
  }, []);

  const openSensorDetails = (sensor) => {
    setSelectedSensor(sensor);
    setModalVisible(true);
  };

  const renderSensorItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.sensorItem}
      onPress={() => openSensorDetails(item)}
    >
      <View style={styles.sensorItemContent}>
        <Text style={styles.sensorId}>{item.id}</Text>
        <Text style={styles.sensorData}>
          Temp: {item.temperature}°C | Humedad: {item.humidity}%
        </Text>
        <Text style={styles.sensorTimestamp}>
          Última actualización: {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Ionicons name="information-circle" size={24} color="#8c6f6f" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitoreo de Sensores ESP32</Text>
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Tarjeta de condiciones climáticas */}
        <WeatherCard weatherData={weatherData} />
        
        {/* Mapa con ubicaciones de sensores */}
        {userLocation && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {/* Marcador de ubicación del usuario */}
            <Marker
              coordinate={userLocation}
              title="Mi Ubicación"
              description={weatherData ? `${Math.round(weatherData.main.temp)}°C, ${weatherData.main.humidity}%` : "Tu ubicación actual"}
              pinColor="blue"
            />

            {/* Marcadores de sensores */}
            {sensors.map((sensor, index) => (
              <Marker
                key={index}
                coordinate={sensor.location}
                title={sensor.id}
                description={`Temp: ${sensor.temperature}°C | Humedad: ${sensor.humidity}%`}
                onPress={() => openSensorDetails(sensor)}
              />
            ))}
          </MapView>
        )}

        {/* Lista de sensores */}
        <FlatList
          data={sensors}
          renderItem={renderSensorItem}
          keyExtractor={(item) => item.id}
          style={styles.sensorList}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Modal de detalles del sensor */}
      {selectedSensor && (
        <SensorDetailsModal
          visible={modalVisible}
          sensor={selectedSensor}
          weatherData={weatherData}
          onClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#260808',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#3c1e1e',
  },
  weatherCard: {
    backgroundColor: '#3c1e1e',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4a2a2a',
  },
  weatherTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherText: {
    color: '#ffffff',
    marginLeft: 10,
    fontSize: 14,
  },
  weatherLocation: {
    color: '#8c6f6f',
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  map: {
    height: 250,
    margin: 10,
    borderRadius: 10,
  },
  sensorList: {
    flex: 1,
  },
  sensorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3c1e1e',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#4a2a2a',
  },
  sensorItemContent: {
    flex: 1,
    marginRight: 10,
  },
  sensorId: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sensorData: {
    color: '#8c6f6f',
    fontSize: 14,
  },
  sensorTimestamp: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#3c1e1e',
    borderRadius: 10,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailText: {
    color: '#ffffff',
    marginBottom: 10,
  },
  detailTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  comparisonText: {
    color: '#8c6f6f',
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#8c6f6f',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  closeButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default SensorMonitoring;
