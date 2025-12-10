import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { exerciseRepository } from '@/services/repositories/ExerciseRepository';
import type { Exercise } from '@/types/exercise.type';

export default function ExerciseDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadExercise = async () => {
            if (!id) {
                setError('ID manquant');
                setLoading(false);
                return;
            }

            try {
                const data = await exerciseRepository.findById(Number(id));
                if (!data) {
                    setError('Exercice introuvable');
                } else {
                    setExercise(data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
                setLoading(false);
            }
        };

        loadExercise();
    }, [id]);

    if (loading) {
        return (
            <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text>Chargement...</Text>
            </View>
        );
    }

    if (error || !exercise) {
        return (
            <View style={{ padding: 20 }}>
                <Text>Erreur : {error || 'Exercice introuvable'}</Text>
            </View>
        );
    }

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>
                Détails de l&apos;exercice
            </Text>

            <View style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>ID:</Text>
                <Text>{exercise.id}</Text>
            </View>

            <View style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Nom:</Text>
                <Text>{exercise.name}</Text>
            </View>

            <View style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Catégorie:</Text>
                <Text>{exercise.category || 'Non spécifiée'}</Text>
            </View>

            <View style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Description:</Text>
                <Text>{exercise.description || 'Aucune description'}</Text>
            </View>

            <View style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Type:</Text>
                <Text>{exercise.isCustom ? 'Personnalisé' : 'Standard'}</Text>
            </View>

            <View style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Créé le:</Text>
                <Text>{new Date(exercise.createdAt).toLocaleString('fr-FR')}</Text>
            </View>

            <View style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Modifié le:</Text>
                <Text>{new Date(exercise.updatedAt).toLocaleString('fr-FR')}</Text>
            </View>
        </View>
    );
}
