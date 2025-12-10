import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import * as yup from 'yup';
import { exerciseRepository } from '@/services/repositories/ExerciseRepository';
import { Button, Input, Card, CardContent, Badge, SafeAreaView, Select } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';
import { ExerciseCategoryColors } from '@/constants/Colors';
import type { ExerciseCategory } from '@/types/exercise.type';

// Schéma de validation Yup
const exerciseSchema = yup.object({
    name: yup
        .string()
        .required('Le nom est obligatoire')
        .min(3, 'Le nom doit contenir au moins 3 caractères')
        .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
    category: yup.string().nullable(),
    description: yup.string().max(500, 'La description ne peut pas dépasser 500 caractères').nullable(),
});

type ExerciseFormValues = {
    name: string;
    category: ExerciseCategory | '';
    description: string;
};

export default function CreateExercise() {
    const router = useRouter();
    const colors = useThemeColors();
    const [loading, setLoading] = useState(false);

    const initialValues: ExerciseFormValues = {
        name: '',
        category: '',
        description: '',
    };

    const handleSubmit = async (values: ExerciseFormValues) => {
        setLoading(true);
        try {
            await exerciseRepository.create({
                name: values.name.trim(),
                category: values.category || null,
                description: values.description.trim() || null,
                isCustom: true,
            });

            Alert.alert('✅ Succès', 'Exercice créé avec succès', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (err) {
            Alert.alert('❌ Erreur', err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    const categories: SelectOption[] = [
        { label: 'Aucune', value: '' },
        { label: 'Cardio', value: 'cardio' },
        { label: 'Force', value: 'strength' },
        { label: 'Mobilité', value: 'mobility' },
        { label: 'Autre', value: 'other' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[TextStyles.h2, { color: colors.text }]}>Nouvel exercice</Text>
                        <Text style={[TextStyles.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                            Créez un exercice personnalisé pour vos séances
                        </Text>
                    </View>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={exerciseSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                            <View>
                                <Card variant="elevated">
                                    <CardContent>
                                        {/* Nom */}
                                        <Input
                                            label="Nom de l'exercice *"
                                            placeholder="Ex: Pompes, Squats..."
                                            value={values.name}
                                            onChangeText={handleChange('name')}
                                            onBlur={handleBlur('name')}
                                            error={touched.name && errors.name ? errors.name : undefined}
                                            autoCapitalize="sentences"
                                        />

                                        {/* Catégorie */}
                                        <Select
                                            label="Catégorie"
                                            value={values.category}
                                            options={categories}
                                            onValueChange={(itemValue) => setFieldValue('category', itemValue)}
                                            placeholder="Sélectionner une catégorie"
                                        />
                                        {values.category && (
                                            <Badge
                                                variant="neutral"
                                                size="sm"
                                                style={{
                                                    marginTop: Spacing.sm,
                                                    backgroundColor:
                                                        ExerciseCategoryColors[values.category as ExerciseCategory]
                                                            ?.background || colors.backgroundTertiary,
                                                }}
                                            >
                                                {categories.find((c) => c.value === values.category)?.label}
                                            </Badge>
                                        )}

                                        {/* Description */}
                                        <Input
                                            label="Description"
                                            placeholder="Décrivez l'exercice, les muscles ciblés..."
                                            value={values.description}
                                            onChangeText={handleChange('description')}
                                            onBlur={handleBlur('description')}
                                            error={
                                                touched.description && errors.description
                                                    ? errors.description
                                                    : undefined
                                            }
                                            multiline
                                            numberOfLines={4}
                                            containerStyle={{ marginTop: Spacing.md }}
                                            style={{ height: 100, textAlignVertical: 'top' }}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Buttons */}
                                <View style={styles.buttonGroup}>
                                    <Button
                                        variant="outline"
                                        onPress={() => router.back()}
                                        style={styles.button}
                                        disabled={loading}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onPress={() => handleSubmit()}
                                        style={styles.button}
                                        loading={loading}
                                        disabled={loading}
                                    >
                                        Créer
                                    </Button>
                                </View>
                            </View>
                        )}
                    </Formik>

                    {/* Spacer bottom for keyboard */}
                    <View style={{ height: Spacing.xxl }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Layout.screenPadding,
    },
    header: {
        marginBottom: Spacing.lg,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    button: {
        flex: 1,
    },
});
