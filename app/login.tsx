import React, { useState } from 'react';
import { ScrollView,KeyboardAvoidingView,Platform,View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { loginUser } from '../utils/auth';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // 👈 estado para loading

  const handleLogin = async () => {
    setLoading(true); // 👈 activa loading
    try {
      const user = await loginUser(email, password);
      if (user) {
        Alert.alert('Éxito', 'Sesión iniciada correctamente');
        router.replace('/dashboard');
      } else {
        Alert.alert('Error', 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema al iniciar sesión');
    } finally {
      setLoading(false); // 👈 desactiva loading
    }
  };

  return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
  >
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ headerShown: false }} />

      <Image source={require('../assets/images/login-image.png')} style={styles.image} />

      <Text style={styles.title}>Bienvenido a{"\n"}MediAlert</Text>
      <Text style={styles.subtitle}>Gestione sus medicamentos con facilidad</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        placeholderTextColor="#888" // 👈 agregamos esto
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#888" // 👈 agregamos esto
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#5f41ff" style={{ marginBottom: 12 }} />}

      <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Iniciando sesión...' : 'Iniciar sesión'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/RecoverPassword')}>
        <Text style={styles.link}>¿Has olvidado tu contraseña?</Text>
      </TouchableOpacity>

      <View style={styles.bottomIcons}>
        <Ionicons name="information-circle-outline" size={24} color="gray" />
        <TouchableOpacity onPress={() => router.push('/setting')}>
          <Ionicons name="settings-outline" size={24} color="gray" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: '#fff',
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
  scrollContainer: {
  flexGrow: 1,
  justifyContent: 'center',
  padding: 24,
  backgroundColor: '#fff',
},
});
