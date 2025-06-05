import React, { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import Constants from 'expo-constants';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importar componentes
import ChatBot from './components/ChatBot';
import FotoAnalizador from './components/FotoAnalizador';
import Login from './components/Login';
import SensorMonitoring from './components/SensorMonitoring';
import VentasWebView from './components/VentasWebView';

// Configuración de la API de Google Generative AI
const API_KEY = "AIzaSyB0PwKCoJANwjpbfRwGN9uRfn-qqOkj7hw";
const MODEL_NAME = "gemini-1.5-flash";

// Crear el navegador de pestañas
const Tab = createBottomTabNavigator();

export default function App() {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  // Si no está logueado, mostrar pantalla de login
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#260808"
        translucent={false}
      />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              switch (route.name) {
                case 'Chat':
                  iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                  break;
                case 'Analizador':
                  iconName = focused ? 'leaf' : 'leaf-outline';
                  break;
                case 'Sensores':
                  iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                  break;
                case 'Logout':
                  iconName = 'log-out';
                  break;
                case 'Ventas':
                  iconName = focused ? 'cart' : 'cart-outline';
                  break;

              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#ffffff',
            tabBarInactiveTintColor: '#8c6f6f',
            tabBarStyle: {
              backgroundColor: '#3c1e1e',
              borderTopColor: '#4a2a2a',
              borderTopWidth: 1,
            },
            headerStyle: {
              backgroundColor: '#260808',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen
            name="Chat"
            options={{ title: 'Chat Bot' }}
          >
            {() => <ChatBot apiKey={API_KEY} modelName={MODEL_NAME} />}
          </Tab.Screen>
          <Tab.Screen
            name="Analizador"
            options={{ title: 'Analizador' }}
          >
            {() => <FotoAnalizador apiKey={API_KEY} modelName={MODEL_NAME} />}
          </Tab.Screen>
          <Tab.Screen
            name="Sensores"
            options={{ title: 'Sensores' }}
          >
            {() => <SensorMonitoring />}
          </Tab.Screen>
          <Tab.Screen
            name="Ventas"
            options={{ title: 'Ventas' }}
          >
            {() => <VentasWebView />}
          </Tab.Screen>
          <Tab.Screen
            name="Logout"
            options={{ title: 'Cerrar Sesión' }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                e.preventDefault();
                handleLogout();
              },
            })}
          >
            {() => null}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#260808',
    paddingTop: Constants.statusBarHeight,
  },
});
