import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Dashboard() {
    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Dashboard</Text>

            <Link href="/exercise/list" style={{ marginBottom: 10 }}>
                <Text style={{ color: 'blue', fontSize: 18 }}>
                    📋 Liste des exercices
                </Text>
            </Link>

            <Link href="/exercise/create">
                <Text style={{ color: 'blue', fontSize: 18 }}>
                    ➕ Créer un exercice
                </Text>
            </Link>
        </View>
    );
}