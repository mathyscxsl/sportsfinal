import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { exerciseRepository } from '@/services/repositories/ExerciseRepository';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Button, LoadingSpinner, Card, CardContent, SafeAreaView } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';
import type { Exercise } from '@/types/exercise.type';

export default function ListExercises() {
    const router = useRouter();
    const colors = useThemeColors();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadExercises = async () => {
        try {
            setLoading(true);
            const data = await exerciseRepository.findAll();
            setExercises(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExercises();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <LoadingSpinner message="Chargement des exercices..." />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.errorContainer}>
                    <Card variant="outlined">
                        <CardContent>
                            <Text style={[TextStyles.h4, { color: colors.error, marginBottom: Spacing.sm }]}>
                                ❌ Erreur
                            </Text>
                            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
                                {error}
                            </Text>
                            <Button
                                variant="outline"
                                onPress={loadExercises}
                                style={{ marginTop: Spacing.md }}
                            >
                                Réessayer
                            </Button>
                        </CardContent>
                    </Card>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={exercises}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <View>
                                <Text style={[TextStyles.h2, { color: colors.text }]}>
                                    Exercices
                                </Text>
                                <Text style={[TextStyles.bodySmall, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                                    {exercises.length} exercice{exercises.length > 1 ? 's' : ''} au total
                                </Text>
                            </View>
                        </View>
                        <Button
                            variant="primary"
                            onPress={() => router.push('/exercise/create')}
                            style={{ marginTop: Spacing.md }}
                            fullWidth
                        >
                            ➕ Nouvel exercice
                        </Button>
                    </View>
                }
                ListEmptyComponent={
                    <Card variant="filled" style={{ marginTop: Spacing.lg }}>
                        <CardContent style={styles.emptyState}>
                            <Text style={[TextStyles.h3, { marginBottom: Spacing.sm }]}>💪</Text>
                            <Text style={[TextStyles.h4, { color: colors.text, marginBottom: Spacing.xs }]}>
                                Aucun exercice
                            </Text>
                            <Text style={[TextStyles.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                                Commencez par créer votre premier exercice personnalisé
                            </Text>
                            <Button
                                variant="secondary"
                                onPress={() => router.push('/exercise/create')}
                                style={{ marginTop: Spacing.md }}
                            >
                                Créer un exercice
                            </Button>
                        </CardContent>
                    </Card>
                }
                renderItem={({ item }) => (
                    <ExerciseCard
                        exercise={item}
                        onPress={() => router.push(`/exercise/${item.id}`)}
                    />
                )}
                ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: Layout.screenPadding,
    },
    header: {
        marginBottom: Spacing.lg,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    errorContainer: {
        flex: 1,
        padding: Layout.screenPadding,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        padding: Spacing.xl,
    },
});
