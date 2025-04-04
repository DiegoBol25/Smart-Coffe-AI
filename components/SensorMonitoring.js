import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  ScrollView 
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// Componente para mostrar los detalles de un sensor específico
const SensorDetailsModal = ({ visible, sensor, onClose }) => {
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
          <ScrollView>
            <Text style={styles.detailText}>ID: {sensor.id}</Text>
            <Text style={styles.detailText}>Temperatura: {sensor.temperature}°C</Text>
            <Text style={styles.detailText}>Humedad: {sensor.humidity}%</Text>
            <Text style={styles.detailText}>Ubicación: {sensor.location.latitude}, {sensor.location.longitude}</Text>
            <Text style={styles.detailText}>Fecha: {new Date(sensor.timestamp).toLocaleString()}</Text>
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

  // Simular datos de sensores (reemplazar con datos reales de ESP32)
  const fetchSensorData = async () => {
    try {
      // Aquí iría la lógica real de obtención de datos desde tu ESP32
      const mockSensors = [
        {
          id: 'ESP32-001',
          temperature: 25.5,
          humidity: 60,
          location: {
            latitude: -12.046374,
            longitude: -77.042793
          },
          timestamp: Date.now()
        },
        {
          id: 'ESP32-002',
          temperature: 22.3,
          humidity: 55,
          location: {
            latitude: -12.047374,
            longitude: -77.043793
          },
          timestamp: Date.now()
        }
      ];
      setSensors(mockSensors);
    } catch (error) {
      console.error('Error al obtener datos de sensores', error);
    }
  };

  // Obtener ubicación del usuario
  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permiso de ubicación denegado');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    } catch (error) {
      console.error('Error al obtener ubicación', error);
    }
  };

  useEffect(() => {
    fetchSensorData();
    getUserLocation();
    
    // Actualizar datos periódicamente (cada 5 minutos)
    const intervalId = setInterval(fetchSensorData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
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
      </View>
      <Ionicons name="information-circle" size={24} color="#8c6f6f" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitoreo de Sensores ESP32</Text>
      
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
      />

      {/* Modal de detalles del sensor */}
      {selectedSensor && (
        <SensorDetailsModal
          visible={modalVisible}
          sensor={selectedSensor}
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
  map: {
    height: 300,
    width: '100%',
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