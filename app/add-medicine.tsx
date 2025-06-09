import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getCurrentUser } from '../utils/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';


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

    const [errors, setErrors] = useState<{ [key in keyof Medicine]?: string }>({});
    const [showTimePicker, setShowTimePicker] = useState(false);

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
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    const validate = () => {
        let newErrors: any = {};
        const requiredFields: (keyof Medicine)[] = ['name', 'dose', 'unit', 'frequency', 'time', 'via', 'duration'];

        requiredFields.forEach(field => {
            if (!medicine[field]) newErrors[field] = 'Este campo es obligatorio';
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
        if (!validate()) return;

        try {
            const user = await getCurrentUser();
            if (!user || !user.email) return Alert.alert('Error', 'No se encontró usuario logueado.');

            const storageKey = `medications_${user.email}`;
            const existingData = await AsyncStorage.getItem(storageKey);
            const meds = existingData ? JSON.parse(existingData) : [];

            const newMed = { ...medicine, id: Date.now().toString() };
            meds.push(newMed);
            await AsyncStorage.setItem(storageKey, JSON.stringify(meds));

            const [hour, minute] = medicine.time.split(':').map(Number);
            const now = new Date();
            let notificationTime = new Date();
            notificationTime.setHours(hour, minute, 0, 0);

            // Si ya pasó esa hora, programa para mañana
            if (notificationTime <= now) {
                notificationTime.setDate(notificationTime.getDate() + 1);
            }

            // Asegurar al menos 5 minutos desde ahora
            const timeDifference = notificationTime.getTime() - now.getTime();
            const minDelay = 5 * 60 * 1000; // 5 minutos en milisegundos

            if (timeDifference < minDelay) {
                notificationTime = new Date(now.getTime() + minDelay);
            }

            // Extraer los valores actualizados
            const scheduleHour = notificationTime.getHours();
            const scheduleMinute = notificationTime.getMinutes();

            // Programar notificación
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `¡Hora de tomar ${medicine.name}!`,
                    body: `Dosis: ${medicine.dose} ${medicine.unit} - Vía: ${medicine.via}`,
                    sound: true,
                },
                trigger: {
                    hour: scheduleHour,
                    minute: scheduleMinute,
                    repeats: true,
                } as any,
            });

            Alert.alert('Éxito', 'Medicamento guardado correctamente');
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo guardar el medicamento.');
        }
    };

    const onChangeTime = (_: any, selectedTime: Date | undefined) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            const hours = selectedTime.getHours().toString().padStart(2, '0');
            const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
            handleChange('time', `${hours}:${minutes}`);
        }
    };

    const Label = ({ text }: { text: string }) => (
        <Text style={{ marginBottom: 4, fontWeight: 'bold', color: '#444' }}>{text}</Text>
    );

    const ErrorText = ({ msg }: { msg?: string }) =>
        msg ? <Text style={{ color: 'red', marginTop: -10, marginBottom: 10 }}>{msg}</Text> : null;

    return (
        <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#fff', flexGrow: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Agregar Medicamento</Text>

            {/* Campos con etiquetas y errores */}
            <Label text="Nombre del medicamento *" />
            <Input placeholder="Ej: Ibuprofeno" value={medicine.name} onChangeText={val => handleChange('name', val)} />
            <ErrorText msg={errors.name} />

            <Label text="Dosis *" />
            <Input placeholder="Ej: 500" value={medicine.dose} onChangeText={val => handleChange('dose', val)} />
            <ErrorText msg={errors.dose} />

            <Label text="Unidad *" />
            <Input placeholder="mg, ml, gotas, etc." value={medicine.unit} onChangeText={val => handleChange('unit', val)} />
            <ErrorText msg={errors.unit} />

            <Label text="Frecuencia *" />
            <Input placeholder="Cada cuántas horas/días" value={medicine.frequency} onChangeText={val => handleChange('frequency', val)} />
            <ErrorText msg={errors.frequency} />

            <Label text="Hora de toma *" />
            <TouchableOpacity
                style={{
                    backgroundColor: '#f4f4f5',
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 10,
                }}
                onPress={() => setShowTimePicker(true)}
            >
                <Text style={{ color: medicine.time ? '#000' : '#999' }}>
                    {medicine.time || 'Seleccionar hora'}
                </Text>
            </TouchableOpacity>
            {showTimePicker && (
                <DateTimePicker
                    mode="time"
                    value={new Date()}
                    onChange={onChangeTime}
                    is24Hour
                    display="default"
                />
            )}
            <ErrorText msg={errors.time} />

            <Label text="Vía de administración *" />
            <Input placeholder="Oral, inyectado, etc." value={medicine.via} onChangeText={val => handleChange('via', val)} />
            <ErrorText msg={errors.via} />

            <Label text="Duración del tratamiento *" />
            <Input placeholder="Ej: 7 días" value={medicine.duration} onChangeText={val => handleChange('duration', val)} />
            <ErrorText msg={errors.duration} />

            <Label text="Notas adicionales" />
            <Input placeholder="Instrucciones especiales" value={medicine.notes} onChangeText={val => handleChange('notes', val)} multiline />

            {/* Imagen */}
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

            {/* Botón Guardar */}
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
