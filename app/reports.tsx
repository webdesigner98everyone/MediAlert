import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../utils/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface Medication {
    id: string;
    name: string;
    time: string;
    image: string;
    date: string;
    status?: 'pendiente' | 'tomado' | 'omitido';
}

export default function Reports() {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadMeds = async () => {
            const user = await getCurrentUser();
            if (!user) return;

            const stored = await AsyncStorage.getItem(`medications_${user.email}`);
            const parsed: Medication[] = stored ? JSON.parse(stored) : [];
            // Aseguramos que todos los medicamentos tengan status
            const normalized = parsed.map((m) => ({
                ...m,
                status: m.status || 'pendiente',
            }));

            setMedications(normalized);
        };

        loadMeds();
    }, []);

    const formatDate = (date: Date) => date.toLocaleDateString();

    const isDateInRange = (dateStr: string) => {
        if (!startDate || !endDate) return true;
        const [day, month, year] = dateStr.split('/');
        const medDate = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return medDate >= start && medDate <= end;
    };

    const filterByStatus = (status: Medication['status']) =>
        medications.filter(
            (med) => med.status === status && med.date && isDateInRange(med.date)
        );

    const clearFilters = () => {
        setStartDate(null);
        setEndDate(null);
    };

    const totalEncontrados = medications.filter(m => m.date && isDateInRange(m.date)).length;

    const exportToPDF = async () => {
        try {
            let html = `
                <h1>Reporte de Medicamentos</h1>
                <p>Fecha desde: ${startDate ? formatDate(startDate) : '-'} | hasta: ${endDate ? formatDate(endDate) : '-'}</p>
                <p>Total encontrados: <b>${totalEncontrados}</b></p>
            `;

            medications
                .filter(m => m.date && isDateInRange(m.date))
                .forEach(m => {
                    html += `
                    <div style="margin-bottom: 10px;">
                        <strong>${m.name}</strong><br/>
                        Hora: ${m.time}<br/>
                        Fecha: ${m.date}<br/>
                        Estado: ${m.status}
                    </div>`;
                });

            const { uri } = await Print.printToFileAsync({ html });
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert('Compartir no disponible en este dispositivo');
                return;
            }
            await Sharing.shareAsync(uri);
        } catch (error) {
            Alert.alert('Error al generar PDF', String(error));
        }
    };

    const renderSection = (title: string, data: Medication[]) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {data.length === 0 ? (
                <Text style={styles.noData}>No hay registros en este rango</Text>
            ) : (
                data.map((item) => (
                    <View key={item.id} style={styles.reportCard}>
                        <Image
                            source={item.image ? { uri: item.image } : require('../assets/images/default-med.jpg')}
                            style={styles.icon}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.reportTitle}>{item.name}</Text>
                            <Text style={styles.reportDetails}>Hora: {item.time}</Text>
                            <Text style={styles.reportDetails}>Fecha: {item.date}</Text>
                        </View>
                    </View>
                ))
            )}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Reportes</Text>

            <View style={styles.dateContainer}>
                <TouchableOpacity onPress={() => setShowStartPicker(true)}>
                    <Text style={styles.dateText}>
                        {startDate ? `Inicio: ${formatDate(startDate)}` : 'Selecciona fecha de inicio'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowEndPicker(true)}>
                    <Text style={styles.dateText}>
                        {endDate ? `Fin: ${formatDate(endDate)}` : 'Selecciona fecha final'}
                    </Text>
                </TouchableOpacity>
            </View>

            {showStartPicker && (
                <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={(_, selectedDate) => {
                        setShowStartPicker(false);
                        if (selectedDate) setStartDate(selectedDate);
                    }}
                />
            )}

            {showEndPicker && (
                <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={(_, selectedDate) => {
                        setShowEndPicker(false);
                        if (selectedDate) setEndDate(selectedDate);
                    }}
                />
            )}

            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={{ color: 'white' }}>Limpiar Filtros</Text>
            </TouchableOpacity>

            <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>
                Medicamentos encontrados: {totalEncontrados}
            </Text>

            {renderSection('Medicamentos Tomados ✅', filterByStatus('tomado'))}
            {renderSection('Medicamentos Omitidos ❌', filterByStatus('omitido'))}
            {renderSection('Medicamentos Pendientes 🕒', filterByStatus('pendiente'))}

            <TouchableOpacity style={styles.pdfButton} onPress={exportToPDF}>
                <Text style={{ color: 'white' }}>Exportar a PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.returnButton} onPress={() => router.push('/dashboard')}>
                <Text style={styles.returnText}>Volver</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
        </ScrollView>
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
        marginBottom: 20,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dateText: {
        color: '#6a4df5',
        fontWeight: 'bold',
    },
    clearButton: {
        backgroundColor: '#ff3b30',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 10,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    reportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    icon: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 10,
    },
    reportTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    reportDetails: {
        color: '#555',
        fontSize: 13,
    },
    noData: {
        fontStyle: 'italic',
        color: '#888',
    },
    pdfButton: {
        backgroundColor: '#007aff',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
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
});
