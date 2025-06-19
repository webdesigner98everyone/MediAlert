import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../utils/auth';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Medication {
    id: string;
    name: string;
    time: string;
    image: string;
    date: string;
    status?: 'pendiente' | 'tomado' | 'omitido';
}

export default function History() {
    const [search, setSearch] = useState('');
    const [medications, setMedications] = useState<Medication[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedMedId, setSelectedMedId] = useState<string | null>(null);
    const [date, setDate] = useState(new Date());
    const router = useRouter();

    useEffect(() => {
        const loadMeds = async () => {
            const user = await getCurrentUser();
            if (!user) return;

            const stored = await AsyncStorage.getItem(`medications_${user.email}`);
            const parsed: Medication[] = stored ? JSON.parse(stored) : [];
            setMedications(parsed);
        };

        loadMeds();
    }, []);

    const updateStatus = async (id: string, status: Medication['status']) => {
        const user = await getCurrentUser();
        if (!user) return;

        const med = medications.find(m => m.id === id);
        if (!med) return;

        // Validar si intenta marcar como tomado sin haber asignado fecha
        if (status === 'tomado' && (!med.date || med.date.trim() === '')) {
            alert('Debes asignar una fecha antes de marcar este medicamento como "Tomado".');
            return;
        }

        const updatedMeds = medications.map(med => {
            if (med.id === id) {
                if (status === 'pendiente' || status === 'omitido') {
                    return { ...med, status, date: '' }; // Limpia la fecha
                } else {
                    return { ...med, status }; // Ya validamos que hay fecha
                }
            }
            return med;
        });

        setMedications(updatedMeds);
        await AsyncStorage.setItem(`medications_${user.email}`, JSON.stringify(updatedMeds));
    };

    const updateDate = async (id: string, newDate: Date) => {
        const user = await getCurrentUser();
        if (!user) return;

        const formattedDate = newDate.toLocaleDateString();
        const updatedMeds = medications.map(m =>
            m.id === id ? { ...m, date: formattedDate } : m
        );

        setMedications(updatedMeds);
        await AsyncStorage.setItem(`medications_${user.email}`, JSON.stringify(updatedMeds));
    };

    const onChangeDate = (_: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate && selectedMedId) {
            setDate(selectedDate);
            updateDate(selectedMedId, selectedDate);
            setSelectedMedId(null);
        }
    };

    const filtered = medications.filter(med =>
        med.name.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }: { item: Medication }) => (
        <View style={styles.card}>
            <Image
                source={item.image ? { uri: item.image } : require('../assets/images/default-med.jpg')}
                style={styles.image}
            />
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.details}>Hora De Toma: {item.time}</Text>
                <Text style={styles.details}>
                    {item.status === 'tomado'
                        ? `✅ Tomado el: ${item.date || 'Sin fecha registrada'}`
                        : item.status === 'omitido'
                            ? '❌ Este medicamento fue omitido'
                            : '🕒 Medicamento pendiente de toma'}
                </Text>

                <View style={styles.statusButtons}>
                    <TouchableOpacity
                        style={[styles.btnTomado, item.status === 'tomado' && { opacity: 0.6 }]}
                        onPress={() => {
                            if (item.status === 'tomado') {
                                showDisabledAlert();
                            } else {
                                updateStatus(item.id, 'tomado');
                            }
                        }}
                    >
                        <Text style={styles.btnText}>Tomado</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btnPendiente, item.status === 'tomado' && { opacity: 0.3 }]}
                        onPress={() => {
                            if (item.status === 'tomado') {
                                showDisabledAlert();
                            } else {
                                updateStatus(item.id, 'pendiente');
                            }
                        }}
                    >
                        <Text style={styles.btnText}>Pendiente</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btnOmitido, item.status === 'tomado' && { opacity: 0.3 }]}
                        onPress={() => {
                            if (item.status === 'tomado') {
                                showDisabledAlert();
                            } else {
                                updateStatus(item.id, 'omitido');
                            }
                        }}
                    >
                        <Text style={styles.btnText}>Omitido</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => {
                        setSelectedMedId(item.id);
                        setShowDatePicker(true);
                    }}
                >
                    {item.status !== 'tomado' && (
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => {
                                setSelectedMedId(item.id);
                                setShowDatePicker(true);
                            }}
                        >
                            <Ionicons name="calendar-outline" size={18} color="#6a4df5" />
                            <Text style={styles.dateButtonText}>Asignar Fecha</Text>
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
    const showDisabledAlert = () => {
        alert('Este medicamento ya fue marcado como "Tomado" y no puede cambiarse a otro estado.');
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Historial De Tomadas</Text>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar Pendiente"
                    placeholderTextColor="#aaa"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <FlatList
                data={filtered}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No hay registros.</Text>}
            />

            <TouchableOpacity style={styles.returnButton} onPress={() => router.push('/dashboard')}>
                <Text style={styles.returnText}>Volver</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={onChangeDate}
                />
            )}
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
    card: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 10,
        marginBottom: 15,
        gap: 10,
        alignItems: 'center',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 10,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    details: {
        color: '#555',
        fontSize: 13,
    },
    statusText: {
        marginTop: 5,
        fontStyle: 'italic',
        color: '#444',
    },
    statusButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    btnTomado: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    btnPendiente: {
        backgroundColor: '#FFC107',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    btnOmitido: {
        backgroundColor: '#F44336',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    returnButton: {
        backgroundColor: '#6a4df5',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 40,
    },
    returnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 10,
    },
    dateButtonText: {
        color: '#6a4df5',
        fontWeight: 'bold',
    },
});
