import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getCurrentUser } from '../utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfile() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      const user = await getCurrentUser(); // usamos función de auth.ts
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
      }
    };
    loadUserData();
  }, []);

  const handleSaveChanges = async () => {
    if (!name || !email) {
      alert('Por favor completa todos los campos.');
      return;
    }

    const updatedUser = { name, email, password: 'temporal' }; // el password debe mantenerse
    const existingData = await getCurrentUser();
    if (existingData) {
      updatedUser.password = existingData.password;
      await AsyncStorage.setItem('active_user', JSON.stringify(updatedUser));

      // Si quieres también actualizar el array completo de usuarios registrados:
      const usersData = await AsyncStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const updatedUsers = users.map((u: any) =>
          u.email === existingData.email ? updatedUser : u
        );
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      }

      alert('Perfil actualizado correctamente.');
      router.back();
    } else {
      alert('No se pudo actualizar el perfil. Intenta de nuevo.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/images/login-image.png')} style={styles.image} />

      <Text style={styles.title}>Editar Perfil</Text>
      <Text style={styles.subtitle}>Actualiza tu nombre y correo electrónico.</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        editable={false} // Normalmente no se permite editar el correo
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveText}>Guardar Cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
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
    fontWeight: 'bold',
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
  saveButton: {
    backgroundColor: '#6a4df5',
    width: '85%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backText: {
    color: '#6a4df5',
    marginTop: 10,
    fontWeight: 'bold',
  },
});
