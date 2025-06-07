import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter(); // 👈 Para navegar

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user');
      if (!jsonValue) {
        alert('Usuario no encontrado. Regístrate primero.');
        return;
      }

      const user = JSON.parse(jsonValue);

      if (email === user.email && password === user.password) {
        alert('Inicio de sesión exitoso');
        router.replace('/(tabs)');
      } else {
        alert('Correo o contraseña incorrectos');
      }
    } catch (e) {
      console.error(e);
      alert('Error al iniciar sesión');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Image source={require('../assets/images/login-image.png')} style={styles.image} />

      <Text style={styles.title}>Bienvenido a{"\n"}MediAlert</Text>
      <Text style={styles.subtitle}>Gestione sus medicamentos con facilidad</Text>

      <TextInput style={styles.input} placeholder="Correo electrónico" value={email} onChangeText={setEmail} />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.link}>¿Has olvidado tu contraseña?</Text>
      </TouchableOpacity>

      <View style={styles.bottomIcons}>
        <Ionicons name="information-circle-outline" size={24} color="gray" />
        <Ionicons name="settings-outline" size={24} color="gray" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    color: 'gray',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: '#5f41ff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: '#5f41ff',
    marginTop: 8,
  },
  bottomIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 80,
    marginTop: 40,
  },
});
