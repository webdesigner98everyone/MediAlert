import React, { useState } from 'react';
import { KeyboardAvoidingView, View, Platform, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function RecoverPassword() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handlePasswordReset = () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico.');
      return;
    }

    // Aquí podrías conectar con tu backend o lógica de recuperación
    Alert.alert('Revisa tu correo', 'Te hemos enviado instrucciones para restablecer tu contraseña.');
    router.back(); // Vuelve al login
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={require('../assets/images/login-image.png')} style={styles.image} />

        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
          <Text style={styles.buttonText}>Enviar instrucciones</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>¿Recordaste tu contraseña? Inicia sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  button: {
    backgroundColor: '#6a4df5',
    width: '85%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#6a4df5',
    marginTop: 10,
    fontWeight: 'bold',
  },
});
