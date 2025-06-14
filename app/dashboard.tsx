import { View, Text, TextInput, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../utils/auth';
import { Alert } from 'react-native';

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
                                (typeof m.image === 'string' || m.image === null)  // Permite null
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

    const handleEdit = (id: string) => {
        router.push({
            pathname: '/edit-medicine/[id]',
            params: { id },
        });
    };

    const handleDelete = async (id: string) => {
        try {
            const user = await getCurrentUser();
            if (!user) return;

            const updated = medications.filter(med => med.id !== id);
            await AsyncStorage.setItem(`medications_${user.email}`, JSON.stringify(updated));
            setMedications(updated);
            // ✅ Confirmación al usuario de que fue eliminado
            Alert.alert('Eliminado', 'El medicamento ha sido eliminado correctamente.');
        } catch (error) {
            console.error('Error eliminando medicamento:', error);
            Alert.alert('Error', 'Hubo un problema al eliminar el medicamento.');
        }
    };

    const renderMedication = ({ item }: { item: Medication }) => (
        <View style={styles.medicationItem}>
            <Image
                source={item.image ? { uri: item.image } : require('../assets/images/default-med.jpg')}
                style={styles.image}
            />
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.medicationName}>{item.name}</Text>
                <Text style={styles.medicationTime}>Próxima: {item.time}</Text>
            </View>
            <View style={styles.buttonGroup}>
                <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.editButton}>
                    <Ionicons name="pencil" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        Alert.alert(
                            'Eliminar medicamento',
                            '¿Estás seguro de que deseas eliminar este medicamento?',
                            [
                                {
                                    text: 'Cancelar',
                                    style: 'cancel',
                                },
                                {
                                    text: 'Eliminar',
                                    onPress: () => handleDelete(item.id),
                                    style: 'destructive',
                                },
                            ],
                            { cancelable: true }
                        );
                    }}
                    style={styles.deleteButton}
                >
                    <Ionicons name="trash" size={18} color="#fff" />
                </TouchableOpacity>
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
                <TouchableOpacity
                    style={styles.legendItem}
                    onPress={async () => {
                        router.replace('/login'); // Asegúrate de tener esta ruta
                    }}
                >
                    <Ionicons name="log-out-outline" size={24} color="#333" />
                    <Text style={styles.legendText}>Cerrar sesión</Text>
                </TouchableOpacity>
                <View style={styles.legendItem}>
                    <Ionicons name="checkmark-done-outline" size={20} />
                    <Text>Tomadas</Text>
                </View> <TouchableOpacity
                    style={styles.legendItem}
                    onPress={() => router.push('/EditProfile')} // Asegúrate de tener esta ruta
                >
                    <Ionicons name="person-circle-outline" size={24} color="#333" />
                    <Text style={styles.legendText}>Perfil</Text>
                </TouchableOpacity>
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
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // para Android
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
        marginBottom: 40, // 👈 Agregado para subirlo un poco
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 10,
    },
    editButton: {
        backgroundColor: '#4CAF50', // Verde
        padding: 8,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#FFC107', // Amarillo
        padding: 8,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    legendText: {
        marginTop: 4,
        fontSize: 14,
        color: '#333',
    },

});
