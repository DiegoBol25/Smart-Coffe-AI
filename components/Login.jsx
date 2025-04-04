import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image 
} from 'react-native';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // Validación básica
    if (!username || !password) {
      setError('Por favor, ingresa tu usuario y contraseña');
      return;
    }

    // Credenciales de ejemplo (reemplazar con autenticación real)
    if (username === 'coffe' && password === '1234') {
      setError('');
      onLogin(username);
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <View style={styles.container}>
    

      

      
      <Text style={styles.title}>Iniciar Sesión</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="#8c6f6f"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        placeholderTextColor="#8c6f6f"
      />
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
      
      <TouchableOpacity 
        style={styles.loginButton}
        onPress={handleLogin}
      >
        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#260808',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    backgroundColor: '#3c1e1e',
    color: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#8c6f6f',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
  }
});

export default Login;