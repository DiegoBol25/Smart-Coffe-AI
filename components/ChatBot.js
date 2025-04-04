// ChatBotComponent.js
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as SecureStore from 'expo-secure-store';

// Clave para almacenar los mensajes en el almacenamiento seguro
const MESSAGES_STORAGE_KEY = 'cafe_colombia_chat_messages';

// Mensaje de bienvenida para los caficultores
const WELCOME_MESSAGE = {
  id: 'welcome',
  text: "¡Hola! Soy tu asistente virtual para el café colombiano. Estoy aquí para ayudarte con consejos sobre cultivo, procesamiento, comercialización y cualquier duda sobre la caficultura. ¿En qué puedo ayudarte hoy?",
  sender: 'bot',
  timestamp: new Date().toISOString(),
};

// Preguntas frecuentes para sugerencias rápidas
const QUICK_SUGGESTIONS = [
  "¿Cómo mejorar la calidad de mi café?",
  "Consejos para el control de la roya",
  "Mejores prácticas para la cosecha",
  "Precios actuales del café",
  "Cómo gestionar el agua en mi cultivo"
];

// Componente de burbuja de mensaje
const MessageBubble = ({ message }) => {
  const isBot = message.sender === 'bot';
  
  return (
    <View 
      style={[
        styles.messageBubble, 
        isBot ? styles.botBubble : styles.userBubble
      ]}
    >
      {isBot && (
        <View style={styles.botIdentity}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/30' }} 
            style={styles.botAvatar}
          />
          <Text style={styles.botName}>Asistente Cafetero</Text>
        </View>
      )}
      <Text style={styles.messageText}>{message.text}</Text>
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

// Componente de sugerencias rápidas
const QuickSuggestions = ({ suggestions, onSelectSuggestion, visible }) => {
  if (!visible) return null;
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.suggestionsContainer}
    >
      {suggestions.map((suggestion, index) => (
        <TouchableOpacity
          key={index}
          style={styles.suggestionButton}
          onPress={() => onSelectSuggestion(suggestion)}
        >
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Componente del encabezado
const Header = ({ onClearChat }) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <Text style={styles.headerTitle}>Asistente Cafetero</Text>
      <Text style={styles.headerSubtitle}>Para caficultores colombianos</Text>
    </View>
    <TouchableOpacity onPress={onClearChat} style={styles.clearButton}>
      <Text style={styles.clearButtonText}>Nueva Consulta</Text>
    </TouchableOpacity>
  </View>
);

// Componente principal del chatbot
const ChatBot = ({ apiKey, modelName }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef(null);

  // Instrucciones de contexto para el modelo Gemini
  const contextInstructions = `
    Eres un asistente virtual especializado en ayudar a los caficultores colombianos. 
    Usa un tono amigable, respetuoso y cercano. Habla con términos que un caficultor colombiano entendería.
    Conoces sobre cultivo de café, variedades colombianas (Castillo, Colombia, Caturra, Borbón, Típica, etc.),
    procesamiento, secado, almacenamiento, comercialización, certificaciones, clima, plagas y enfermedades del café.
    Usa siempre términos locales colombianos cuando sea posible.
    Da consejos prácticos y concretos. Cuando no sepas algo específico, sé honesto.
    Respuestas cortas y directas, evitando textos muy largos.
  `;

  // Inicializar la API de Google Generative AI
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  
  // Cargar mensajes guardados al iniciar la aplicación
  useEffect(() => {
    loadMessages();
  }, []);

  // Guardar mensajes en el almacenamiento seguro
  const saveMessages = async (messagesToSave) => {
    try {
      await SecureStore.setItemAsync(
        MESSAGES_STORAGE_KEY, 
        JSON.stringify(messagesToSave)
      );
    } catch (error) {
      console.error('Error al guardar mensajes:', error);
    }
  };

  // Cargar mensajes desde el almacenamiento seguro
  const loadMessages = async () => {
    try {
      const savedMessages = await SecureStore.getItemAsync(MESSAGES_STORAGE_KEY);
      if (savedMessages && JSON.parse(savedMessages).length > 0) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Si no hay mensajes guardados, mostrar el mensaje de bienvenida
        setMessages([WELCOME_MESSAGE]);
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      setMessages([WELCOME_MESSAGE]);
    }
  };

  // Borrar el historial de conversación
  const clearChat = async () => {
    const newMessages = [WELCOME_MESSAGE];
    setMessages(newMessages);
    setShowSuggestions(true);
    try {
      await SecureStore.setItemAsync(
        MESSAGES_STORAGE_KEY,
        JSON.stringify(newMessages)
      );
    } catch (error) {
      console.error('Error al borrar mensajes:', error);
    }
  };

  const sendMessage = async (text = inputText) => {
    if (text.trim() === '') return;

    const userMessage = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setShowSuggestions(false);
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Añadir el contexto a la consulta del usuario
      const prompt = `${contextInstructions}\n\nConsulta del caficultor: ${text}`;
      
      // Generar respuesta usando la API de Gemini
      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };

      const newMessages = [...updatedMessages, botMessage];
      setMessages(newMessages);
      saveMessages(newMessages);
    } catch (error) {
      console.error('Error al generar respuesta:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, parece que hay un problema con la conexión. Por favor, intentá de nuevo más tarde.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };

      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
      saveMessages(newMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header onClearChat={clearChat} />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <QuickSuggestions 
        suggestions={QUICK_SUGGESTIONS}
        onSelectSuggestion={sendMessage}
        visible={showSuggestions}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="¿En qué puedo ayudarte hoy?"
          multiline={true}
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (isLoading || inputText.trim() === '') && styles.sendButtonDisabled
          ]} 
          onPress={() => sendMessage()}
          disabled={isLoading || inputText.trim() === ''}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Enviar</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC', // Fondo color crema para tema cafetero
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#6F4E37', // Color café oscuro
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#f0f0f0',
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#A67B5B', // Color café más claro
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#C8E6C9', // Verde claro
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  botIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  botAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  botName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6F4E37',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  suggestionsContainer: {
    padding: 8,
  },
  suggestionButton: {
    backgroundColor: '#A67B5B', // Color café claro
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 6,
    marginVertical: 4,
  },
  suggestionText: {
    color: '#fff',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D2B48C', // Color café claro
  },
  sendButton: {
    backgroundColor: '#6F4E37', // Color café oscuro
    borderRadius: 20,
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    alignSelf: 'flex-end',
  },
  sendButtonDisabled: {
    backgroundColor: '#A67B5B', // Color café claro cuando está deshabilitado
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatBot;