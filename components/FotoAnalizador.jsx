import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  Button, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { GoogleGenerativeAI } from "@google/generative-ai";

const FotoAnalizador = ({ apiKey, modelName }) => {
  const [image, setImage] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Inicializar Google Generative AI
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  // Solicitar permisos para la cámara y galería
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Se necesitan permisos para acceder a la galería');
      return false;
    }
    return true;
  };

  // Seleccionar imagen de la galería
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setDiagnosis('');
      setError('');
    }
  };

  // Analizar la imagen usando la API
  const analyzeImage = async () => {
    if (!image || !image.base64) {
      setError('Por favor selecciona una imagen primero');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Preparar la imagen para la API
      const imagePart = {
        inlineData: {
          data: image.base64,
          mimeType: image.mimeType || 'image/jpeg',
        },
      };

      // Prompt para análisis de plantas de café
      const prompt = `
        Analiza esta imagen de una planta de café y proporciona un diagnóstico detallado.
        Busca signos de:
        - Enfermedades (roya, antracnosis, etc.)
        - Plagas
        - Deficiencias nutricionales
        - Estado general de la planta
        Incluye recomendaciones específicas para el cuidado.
      `;

      // Generar el análisis
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      setDiagnosis(response.text);
    } catch (error) {
      setError('Error al analizar la imagen: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analizador de Plantas de Café</Text>

      <TouchableOpacity 
        style={styles.imagePicker}
        onPress={pickImage}
      >
        {image ? (
          <Image 
            source={{ uri: image.uri }} 
            style={styles.image} 
          />
        ) : (
          <Text style={styles.imagePickerText}>
            Toca para seleccionar una imagen
          </Text>
        )}
      </TouchableOpacity>

      {image && (
        <Button 
          title={loading ? "Analizando..." : "Analizar Planta"}
          onPress={analyzeImage}
          disabled={loading}
        />
      )}

      {loading && (
        <ActivityIndicator 
          size="large" 
          color="#006400" 
          style={styles.loader}
        />
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {diagnosis && (
        <View style={styles.diagnosisContainer}>
          <Text style={styles.diagnosisTitle}>Diagnóstico:</Text>
          <Text style={styles.diagnosisText}>{diagnosis}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#006400',
    textAlign: 'center',
  },
  imagePicker: {
    width: '100%',
    height: 300,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePickerText: {
    color: '#666',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
    textAlign: 'center',
  },
  diagnosisContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diagnosisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#006400',
  },
  diagnosisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});

export default FotoAnalizador;