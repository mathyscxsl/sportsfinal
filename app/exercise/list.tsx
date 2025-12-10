import { View, Text, ScrollView, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { exerciseRepository } from '@/services/repositories/ExerciseRepository';
import type { Exercise } from '@/types/exercise.type';

export default function ListExercises() {
    const router = useRouter();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadExercises = async () => {
            try {
                const data = await exerciseRepository.findAll();
                setExercises(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
                setLoading(false);
            }
        };

        loadExercises();
    }, []);

    if (loading) {
        return (
            <View style={{ padding: 20 }}>
                <Text>Chargement...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ padding: 20 }}>
                <Text>Erreur : {error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ padding: 20 }}>
            <Text>Exercices ({exercises.length})</Text>
            {exercises.length === 0 ? (
                <Text>Aucun exercice trouvé</Text>
            ) : (
                exercises.map((exercise) => (
                    <Pressable
                        key={exercise.id}
                        onPress={() => router.push(`/exercise/${exercise.id}`)}
                        style={{
                            marginVertical: 10,
                            padding: 10,
                            backgroundColor: '#f0f0f0'
                        }}
                    >
                        <Text>ID: {exercise.id}</Text>
                        <Text>Nom: {exercise.name}</Text>
                        <Text>Catégorie: {exercise.category || 'N/A'}</Text>
                        <Text>Description: {exercise.description || 'N/A'}</Text>
                        <Text>Custom: {exercise.isCustom ? 'Oui' : 'Non'}</Text>
                    </Pressable>
                ))
            )}
        </ScrollView>
    );
}
