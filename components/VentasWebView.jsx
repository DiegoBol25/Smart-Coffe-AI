import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const VentasWebView = () => {
  const [url, setUrl] = useState('https://www.arena-rose.com/'); // Reemplaza con tu URL
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webViewRef = React.useRef(null);

  return (
    <View style={styles.container}>
      {/* Barra de navegación superior */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          onPress={() => webViewRef.current?.goBack()} 
          disabled={!canGoBack}
          style={[styles.button, !canGoBack && styles.disabled]}
        >
          <Ionicons name="arrow-back" size={24} color={canGoBack ? "#fff" : "#888"} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => webViewRef.current?.goForward()} 
          disabled={!canGoForward}
          style={[styles.button, !canGoForward && styles.disabled]}
        >
          <Ionicons name="arrow-forward" size={24} color={canGoForward ? "#fff" : "#888"} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => webViewRef.current?.reload()} 
          style={styles.button}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
          setCanGoForward(navState.canGoForward);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Text>Cargando...</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#260808', // Manteniendo tu estilo
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#3c1e1e', // Color de tu barra de navegación
    padding: 10,
    justifyContent: 'space-around',
  },
  button: {
    padding: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default VentasWebView;