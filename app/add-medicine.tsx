import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,ScrollView,Image,Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getCurrentUser } from '../utils/auth'; // ✅

// Tipado para el estado del medicamento
interface Medicine {
  name: string;
  dose: string;
  unit: string;
  frequency: string;
  time: string;
  via: string;
  duration: string;
  notes: string;
  image: string | null;
}

// Tipado para el componente Input
interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (val: string) => void;
  multiline?: boolean;
}

const Input: React.FC<InputProps> = ({ placeholder, value, onChangeText, multiline = false }) => (
  <View style={{ marginBottom: 14 }}>
    <View
      style={{
        backgroundColor: '#f4f4f5',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: multiline ? 12 : 6,
      }}
    >
      <TextInput
        style={{ flex: 1, fontSize: 16, color: '#333' }}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
      />
    </View>
  </View>
);

const AddMedicine: React.FC = () => {
  const router = useRouter();

  const [medicine, setMedicine] = useState<Medicine>({
    name: '',
    dose: '',
    unit: '',
    frequency: '',
    time: '',
    via: '',
    duration: '',
    notes: '',
    image: null,
  });

  const handleChange = (key: keyof Medicine, value: string) => {
    setMedicine(prev => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setMedicine(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const handleSave = async () => {
    try {
      const userId = await getCurrentUser(); // ✅ CORRECTO

      if (!userId) return Alert.alert('Error', 'No se encontró usuario logueado.');

      const existingData = await AsyncStorage.getItem(`medicamentos_${userId}`);
      const meds = existingData ? JSON.parse(existingData) : [];
      meds.push(medicine);
      await AsyncStorage.setItem(`medicamentos_${userId}`, JSON.stringify(meds));
      Alert.alert('Éxito', 'Medicamento guardado');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar el medicamento.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#fff', flexGrow: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Agregar medicamento</Text>

      <Input placeholder="Nombre" value={medicine.name} onChangeText={val => handleChange('name', val)} />
      <Input placeholder="Dosis" value={medicine.dose} onChangeText={val => handleChange('dose', val)} />
      <Input placeholder="Unidad" value={medicine.unit} onChangeText={val => handleChange('unit', val)} />
      <Input placeholder="Frecuencia" value={medicine.frequency} onChangeText={val => handleChange('frequency', val)} />
      <Input placeholder="Horarios" value={medicine.time} onChangeText={val => handleChange('time', val)} />
      <Input placeholder="A través de" value={medicine.via} onChangeText={val => handleChange('via', val)} />
      <Input placeholder="Duración" value={medicine.duration} onChangeText={val => handleChange('duration', val)} />
      <Input placeholder="Notas" value={medicine.notes} onChangeText={val => handleChange('notes', val)} multiline />

      <TouchableOpacity
        onPress={pickImage}
        style={{
          backgroundColor: '#ede9fe',
          padding: 12,
          borderRadius: 12,
          alignItems: 'center',
          marginTop: 10,
        }}
      >
        <Text style={{ color: '#6c4ee3', fontWeight: 'bold' }}>Adjuntar imagen</Text>
      </TouchableOpacity>

      {medicine.image && (
        <Image
          source={{ uri: medicine.image }}
          style={{ width: '100%', height: 150, marginTop: 10, borderRadius: 8 }}
        />
      )}

      <TouchableOpacity
        onPress={handleSave}
        style={{
          backgroundColor: '#6c4ee3',
          padding: 14,
          borderRadius: 14,
          marginTop: 20,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddMedicine;
