import { View, Text, TextInput, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native'; // ✅ IMPORTANTE
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../utils/auth';

interface Medication {
    id: string;
    name: string;
    time: string;
    image: string; // URI de la imagen
}

export default function Dashboard() {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [search, setSearch] = useState('');
    const router = useRouter();

    const loadMedications = async () => {
        try {
            const user = await getCurrentUser();
            if (user) {
                const storedMeds = await AsyncStorage.getItem(`medications_${user.email}`);
                if (storedMeds) {
                    const parsed = JSON.parse(storedMeds);

                    // Validamos que sea un array con los campos necesarios
                    const validMeds = Array.isArray(parsed)
                        ? parsed.filter(
                            (m) =>
                                typeof m.id === 'string' &&
                                typeof m.name === 'string' &&
                                typeof m.time === 'string' &&
                                typeof m.image === 'string'
                        )
                        : [];

                    setMedications(validMeds);
                } else {
                    setMedications([]);
                }
            }
        } catch (error) {
            console.error('Error al cargar medicamentos:', error);
            setMedications([]);
        }
    };

    // ✅ Ejecuta cada vez que la pantalla se enfoca (al volver a ella)
    useFocusEffect(
        useCallback(() => {
            loadMedications();
        }, [])
    );

    const renderMedication = ({ item }: { item: Medication }) => (
        <View style={styles.medicationItem}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View>
                <Text style={styles.medicationName}>{String(item.name || '')}</Text>
                <Text style={styles.medicationTime}>Próxima: {String(item.time || '')}</Text>
            </View>
        </View>
    );

    const filteredMeds = medications.filter(med =>
        med.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard MediAlert</Text>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por medicamento"
                    placeholderTextColor="#aaa"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <FlatList
                data={filteredMeds}
                renderItem={renderMedication}
                keyExtractor={(item) => item.id}
                style={styles.medList}
                ListEmptyComponent={<Text style={{ textAlign: 'center' }}>No hay medicamentos.</Text>}
            />

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <Ionicons name="time-outline" size={20} />
                    <Text>Pendiente</Text>
                </View>
                <View style={styles.legendItem}>
                    <Ionicons name="checkmark-done-outline" size={20} />
                    <Text>Tomadas</Text>
                </View>
                <View style={styles.legendItem}>
                    <Ionicons name="close-outline" size={20} />
                    <Text>Omitido</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/add-medicine')}
            >
                <Text style={styles.addButtonText}>Agregar medicamento</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingHorizontal: 20,
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        paddingHorizontal: 10,
        borderRadius: 10,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        padding: 10,
        color: '#000',
    },
    medList: {
        marginBottom: 20,
    },
    medicationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 10,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 10,
    },
    medicationName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    medicationTime: {
        color: '#666',
        fontSize: 14,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    legendItem: {
        alignItems: 'center',
    },
    addButton: {
        backgroundColor: '#6a4df5',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
