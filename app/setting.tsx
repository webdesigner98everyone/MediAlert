import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Importamos el hook

const SettingsScreen: React.FC = () => {
    const [notificationSound, setNotificationSound] = useState(false);
    const [notificationVibration, setNotificationVibration] = useState(false);
    const router = useRouter(); // Inicializamos el router

    const handleGoBack = () => {
        router.replace('/login'); // Reemplaza la pantalla actual por el login
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Configuración</Text>

            <View style={styles.section}>
                <Text style={styles.label}>Idioma</Text>
                <Text style={styles.subLabel}>Selecciona tu idioma preferido</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Sonido de notificaciones</Text>
                <Switch
                    value={notificationSound}
                    onValueChange={setNotificationSound}
                />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Vibración de notificaciones</Text>
                <Switch
                    value={notificationVibration}
                    onValueChange={setNotificationVibration}
                />
            </View>

            <TouchableOpacity style={styles.section} activeOpacity={1}>
                <Text style={styles.label}>Ayuda/FAQ</Text>
                <Text style={styles.disabled}>Preguntas frecuentes y soporte</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.section} activeOpacity={1}>
                <Text style={styles.label}>Acerca de la app</Text>
                <Text style={styles.disabled}>Información de la aplicación</Text>
            </TouchableOpacity>

            {/* Botón de volver al login */}
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#222',
    },
    subLabel: {
        fontSize: 13,
        color: '#bbb',
        marginTop: 2,
    },
    disabled: {
        fontSize: 13,
        color: '#ccc',
        marginTop: 2,
    },
    backButton: {
        marginTop: 30,
        alignSelf: 'center',
        backgroundColor: '#6a4df5',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default SettingsScreen;
