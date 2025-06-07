import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Register() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

   const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      alert('Por favor completa todos los campos.');
      return;
    }

    if (password !== confirm) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const user = {
      name,
      email,
      password
    };

    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      alert('Registro exitoso');
      router.replace('/'); // volver al login
    } catch (e) {
      console.error(e);
      alert('Error al guardar el usuario');
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/images/login-image.png')} style={styles.image} />

      <Text style={styles.title}>Registro a {'\n'}<Text style={{ fontWeight: 'bold' }}>MediAlert</Text></Text>
      <Text style={styles.subtitle}>Regístrate para llevar el control a tus medicamentos y procesos médicos.</Text>

      <TextInput style={styles.input} placeholder="Introducir nombre" placeholderTextColor="#999" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Introducir correo electrónico" placeholderTextColor="#999" keyboardType="email-address" value={email} onChangeText={setEmail} />

      <View style={styles.passwordContainer}>
        <TextInput style={styles.passwordInput} placeholder="Crear contraseña" placeholderTextColor="#999" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#aaa" />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput style={styles.passwordInput} placeholder="Confirmar Contraseña" placeholderTextColor="#999" secureTextEntry={!showConfirm} value={confirm} onChangeText={setConfirm} />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Ionicons name={showConfirm ? "eye-off" : "eye"} size={24} color="#aaa" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

      <View style={styles.footerIcons}>
        <Ionicons name="information-circle-outline" size={24} color="#888" />
        <Ionicons name="settings-outline" size={24} color="#888" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 15,
    color: '#000',
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 20,
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '85%',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    marginBottom: 15,
  },
  passwordContainer: {
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },
  registerButton: {
    backgroundColor: '#6a4df5',
    width: '85%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backText: {
    color: '#6a4df5',
    marginTop: 10,
    fontWeight: 'bold',
  },
  footerIcons: {
    flexDirection: 'row',
    gap: 25,
    marginTop: 30,
  },
});
