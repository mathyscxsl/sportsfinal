import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { exerciseRepository } from '@/services/repositories/ExerciseRepository';
import { Button, LoadingSpinner, Card, CardContent, CardHeader, Badge, SafeAreaView } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';
import { ExerciseCategoryColors } from '@/constants/Colors';
import type { Exercise } from '@/types/exercise.type';

export default function ExerciseDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colors = useThemeColors();
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

    // Mapping des anciennes valeurs françaises vers les nouvelles clés anglaises
    const getCategoryKey = (category: string | null): keyof typeof ExerciseCategoryColors => {
        switch (category) {
            case 'cardio':
                return 'cardio';
            case 'strength':
            case 'force': // Support ancienne valeur
                return 'strength';
            case 'mobility':
            case 'mobilité': // Support ancienne valeur
                return 'mobility';
            default:
                return 'other';
        }
    };

    const getCategoryLabel = (category: string | null) => {
        switch (category) {
            case 'cardio':
                return 'Cardio';
            case 'strength':
            case 'force': // Support ancienne valeur
                return 'Force';
            case 'mobility':
            case 'mobilité': // Support ancienne valeur
                return 'Mobilité';
            case 'other':
            case 'autre': // Support ancienne valeur
                return 'Autre';
            default:
                return 'Non spécifiée';
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <LoadingSpinner message="Chargement..." />
            </SafeAreaView>
        );
    }

    if (error || !exercise) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.errorContainer}>
                    <Card variant="outlined">
                        <CardContent>
                            <Text style={[TextStyles.h4, { color: colors.error, marginBottom: Spacing.sm }]}>
                                ❌ Erreur
                            </Text>
                            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
                                {error || 'Exercice introuvable'}
                            </Text>
                            <Button
                                variant="outline"
                                onPress={() => router.back()}
                                style={{ marginTop: Spacing.md }}
                            >
                                Retour
                            </Button>
                        </CardContent>
                    </Card>
                </View>
            </SafeAreaView>
        );
    }

    const categoryKey = getCategoryKey(exercise.category);
    const categoryColor = ExerciseCategoryColors[categoryKey];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[TextStyles.h1, { color: colors.text }]}>{exercise.name}</Text>
                    <View style={styles.badges}>
                        {exercise.category && (
                            <Badge
                                variant="neutral"
                                style={{ backgroundColor: categoryColor.background }}
                            >
                                {getCategoryLabel(exercise.category)}
                            </Badge>
                        )}
                        <Badge variant={exercise.isCustom ? 'info' : 'neutral'}>
                            {exercise.isCustom ? 'Personnalisé' : 'Prédéfini'}
                        </Badge>
                    </View>
                </View>

                {/* Description */}
                {exercise.description && (
                    <Card variant="elevated" style={{ marginBottom: Spacing.md }}>
                        <CardHeader>
                            <Text style={[TextStyles.h4, { color: colors.text }]}>Description</Text>
                        </CardHeader>
                        <CardContent>
                            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
                                {exercise.description}
                            </Text>
                        </CardContent>
                    </Card>
                )}

                {/* Informations */}
                <Card variant="elevated" style={{ marginBottom: Spacing.md }}>
                    <CardHeader>
                        <Text style={[TextStyles.h4, { color: colors.text }]}>Informations</Text>
                    </CardHeader>
                    <CardContent>
                        <View style={styles.infoRow}>
                            <Text style={[TextStyles.label, { color: colors.textSecondary }]}>ID</Text>
                            <Text style={[TextStyles.body, { color: colors.text }]}>#{exercise.id}</Text>
                        </View>

                        <View style={[styles.infoRow, styles.divider, { borderTopColor: colors.border }]}>
                            <Text style={[TextStyles.label, { color: colors.textSecondary }]}>Créé le</Text>
                            <Text style={[TextStyles.bodySmall, { color: colors.text }]}>
                                {formatDate(exercise.createdAt)}
                            </Text>
                        </View>

                        <View style={[styles.infoRow, styles.divider, { borderTopColor: colors.border }]}>
                            <Text style={[TextStyles.label, { color: colors.textSecondary }]}>
                                Modifié le
                            </Text>
                            <Text style={[TextStyles.bodySmall, { color: colors.text }]}>
                                {formatDate(exercise.updatedAt)}
                            </Text>
                        </View>
                    </CardContent>
                </Card>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button variant="outline" onPress={() => router.back()} style={styles.actionButton}>
                        ← Retour
                    </Button>
                    {/* Bouton éditer pour plus tard */}
                    {/* <Button
                        variant="primary"
                        onPress={() => router.push(`/exercise/edit/${exercise.id}`)}
                        style={styles.actionButton}
                    >
                        Modifier
                    </Button> */}
                </View>

                {/* Spacer bottom */}
                <View style={{ height: Spacing.xl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Layout.screenPadding,
    },
    errorContainer: {
        flex: 1,
        padding: Layout.screenPadding,
        justifyContent: 'center',
    },
    header: {
        marginBottom: Spacing.lg,
    },
    badges: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        flexWrap: 'wrap',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    divider: {
        borderTopWidth: 1,
        marginTop: Spacing.sm,
        paddingTop: Spacing.md,
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    actionButton: {
        flex: 1,
    },
});
