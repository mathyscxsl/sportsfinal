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
import { programRepository } from '@/services/repositories/ProgramRepository';
import { Button, Input, Card, CardContent, SafeAreaView } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';

// Schéma de validation Yup
const programSchema = yup.object({
  name: yup
    .string()
    .required('Le nom est obligatoire')
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: yup
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .nullable(),
});

type ProgramFormValues = {
  name: string;
  description: string;
};

export default function CreateProgram() {
  const router = useRouter();
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);

  const initialValues: ProgramFormValues = {
    name: '',
    description: '',
  };

  const handleSubmit = async (values: ProgramFormValues) => {
    setLoading(true);
    try {
      const program = await programRepository.create({
        name: values.name.trim(),
        description: values.description.trim() || undefined,
      });

      Alert.alert('✅ Succès', 'Programme créé avec succès', [
        {
          text: 'Voir le programme',
          onPress: () => router.replace(`/program/${program.id}`),
        },
        {
          text: 'Retour',
          onPress: () => router.back(),
          style: 'cancel',
        },
      ]);
    } catch (err) {
      Alert.alert('❌ Erreur', err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={[TextStyles.h2, { color: colors.text }]}>Nouveau programme</Text>
            <Text style={[TextStyles.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
              Créez un programme d&#39;entraînement pour organiser vos séances
            </Text>
          </View>

          <Formik
            initialValues={initialValues}
            validationSchema={programSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View>
                <Card variant="elevated">
                  <CardContent>
                    {/* Nom */}
                    <Input
                      label="Nom du programme *"
                      placeholder="Ex: Programme été, Full body, etc."
                      value={values.name}
                      onChangeText={handleChange('name')}
                      onBlur={handleBlur('name')}
                      error={touched.name && errors.name ? errors.name : undefined}
                      autoCapitalize="sentences"
                    />

                    {/* Description */}
                    <Input
                      label="Description"
                      placeholder="Décrivez les objectifs de ce programme..."
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

                {/* Info Card */}
                <Card variant="filled" style={{ marginTop: Spacing.md }}>
                  <CardContent>
                    <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                      💡 Après la création, vous pourrez ajouter des séances à ce programme
                    </Text>
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
