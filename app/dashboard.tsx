import { View, Text, TextInput, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';

interface Medication {
  id: string;
  name: string;
  time: string;
  image: any;
}

export default function Dashboard() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const router = useRouter();

  useEffect(() => {
    setMedications([
      {
        id: '1',
        name: 'Aspirina',
        time: '8:00 AM',
        image: require('../assets/images/aspirina.jpg'),
      },
      {
        id: '2',
        name: 'Ibuprofeno',
        time: '12:00 PM',
        image: require('../assets/images/ibuprofeno.jpg'),
      },
      {
        id: '3',
        name: 'Paracetamol',
        time: '6:00 PM',
        image: require('../assets/images/paracetamol.jpg'),
      },
    ]);
  }, []);

  const renderMedication = ({ item }: { item: Medication }) => (
    <View style={styles.medicationItem}>
      <Image source={item.image} style={styles.image} />
      <View>
        <Text style={styles.medicationName}>{item.name}</Text>
        <Text style={styles.medicationTime}>Próxima: {item.time}</Text>
      </View>
    </View>
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
        />
      </View>

      <FlatList
        data={medications}
        renderItem={renderMedication}
        keyExtractor={(item) => item.id}
        style={styles.medList}
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
