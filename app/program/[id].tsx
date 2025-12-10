import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Formik } from 'formik';
import * as yup from 'yup';
import { programRepository } from '@/services/repositories/ProgramRepository';
import { programSessionRepository } from '@/services/repositories/ProgramSessionRepository';
import { Button, Input, Card, CardContent, SafeAreaView, LoadingSpinner, Badge } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';
import { SessionTypeColors } from '@/constants/Colors';
import type { Program } from '@/types/program.type';
import type { Session } from '@/types/session.type';

type SessionWithProgramInfo = Session & {
  programSessionId: number;
  orderIndex: number;
};

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

export default function ProgramDetail() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [sessions, setSessions] = useState<SessionWithProgramInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [removingSessionId, setRemovingSessionId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const programData = await programRepository.findById(Number(id));
      if (!programData) {
        Alert.alert('Erreur', 'Programme introuvable');
        router.back();
        return;
      }
      setProgram(programData);

      // Charger les séances avec leurs IDs de liaison et orderIndex
      const sessionsData = await programRepository.findSessionsWithProgramSessionIds(Number(id));
      setSessions(sessionsData);
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const handleUpdate = async (values: ProgramFormValues) => {
    if (!program) return;

    setUpdating(true);
    try {
      const updated = await programRepository.update({
        id: program.id,
        name: values.name.trim(),
        description: values.description.trim() || undefined,
      });
      setProgram(updated);
      setEditMode(false);
      Alert.alert('✅ Succès', 'Programme mis à jour avec succès');
    } catch (err) {
      Alert.alert('❌ Erreur', err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    if (!program) return;

    const sessionCount = sessions.length;
    Alert.alert(
      'Confirmer la suppression',
      sessionCount > 0
        ? `Ce programme contient ${sessionCount} séance${sessionCount > 1 ? 's' : ''}. Êtes-vous sûr de vouloir le supprimer ? Toutes les séances seront également supprimées.`
        : 'Êtes-vous sûr de vouloir supprimer ce programme ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await programRepository.delete(program.id);
              Alert.alert('✅ Succès', 'Programme supprimé', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (err) {
              Alert.alert('❌ Erreur', err instanceof Error ? err.message : 'Erreur inconnue');
            }
          },
        },
      ]
    );
  };

  const handleRemoveSession = (session: SessionWithProgramInfo) => {
    if (!program) return;

    Alert.alert(
      'Retirer la séance',
      `Êtes-vous sûr de vouloir retirer "${session.name}" de ce programme ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            setRemovingSessionId(session.id);
            try {
              await programSessionRepository.removeSessionFromProgram(session.programSessionId);
              await loadData();
              Alert.alert('✅ Succès', 'Séance retirée du programme');
            } catch (err) {
              Alert.alert('❌ Erreur', err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
              setRemovingSessionId(null);
            }
          },
        },
      ]
    );
  };

  if (loading || !program) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner message="Chargement..." />
      </SafeAreaView>
    );
  }

  const initialValues: ProgramFormValues = {
    name: program.name,
    description: program.description || '',
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
          {!editMode && (
            <View style={styles.header}>
              <Text style={[TextStyles.h2, { color: colors.text }]}>{program.name}</Text>
              {program.description && (
                <Text style={[TextStyles.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                  {program.description}
                </Text>
              )}
              <View style={styles.metadata}>
                <Badge variant="neutral" size="sm">
                  {sessions.length} séance{sessions.length !== 1 ? 's' : ''}
                </Badge>
                <Text style={[TextStyles.caption, { color: colors.textTertiary }]}>
                  Créé le {new Date(program.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </View>
          )}

          {/* Edit Form */}
          {editMode && (
            <Formik
              initialValues={initialValues}
              validationSchema={programSchema}
              onSubmit={handleUpdate}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.editForm}>
                  <Card variant="elevated">
                    <CardContent>
                      <Input
                        label="Nom du programme *"
                        value={values.name}
                        onChangeText={handleChange('name')}
                        onBlur={handleBlur('name')}
                        error={touched.name && errors.name ? errors.name : undefined}
                        autoCapitalize="sentences"
                      />

                      <Input
                        label="Description"
                        value={values.description}
                        onChangeText={handleChange('description')}
                        onBlur={handleBlur('description')}
                        error={touched.description && errors.description ? errors.description : undefined}
                        multiline
                        numberOfLines={4}
                        containerStyle={{ marginTop: Spacing.md }}
                        style={{ height: 100, textAlignVertical: 'top' }}
                      />
                    </CardContent>
                  </Card>

                  <View style={styles.buttonGroup}>
                    <Button
                      variant="outline"
                      onPress={() => setEditMode(false)}
                      style={styles.button}
                      disabled={updating}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      onPress={() => handleSubmit()}
                      style={styles.button}
                      loading={updating}
                      disabled={updating}
                    >
                      Sauvegarder
                    </Button>
                  </View>
                </View>
              )}
            </Formik>
          )}

          {/* Actions */}
          {!editMode && (
            <Card variant="elevated">
              <CardContent>
                <Text style={[TextStyles.h4, { color: colors.text, marginBottom: Spacing.md }]}>
                  Actions
                </Text>
                <View style={styles.actionButtons}>
                  <Button
                    variant="secondary"
                    onPress={() => setEditMode(true)}
                    fullWidth
                  >
                    ✏️ Éditer
                  </Button>
                  <Button
                    variant="danger"
                    onPress={handleDelete}
                    fullWidth
                  >
                    🗑️ Supprimer
                  </Button>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Sessions List */}
          {!editMode && (
            <Card variant="elevated" style={{ marginTop: Spacing.md }}>
              <CardContent>
                <View style={styles.sectionHeader}>
                  <Text style={[TextStyles.h4, { color: colors.text }]}>
                    Séances ({sessions.length})
                  </Text>
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => router.push(`/program/${program.id}/add-session`)}
                  >
                    ➕ Ajouter
                  </Button>
                </View>

                {sessions.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={[TextStyles.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                      Aucune séance dans ce programme
                    </Text>
                    <Text style={[TextStyles.caption, { color: colors.textTertiary, textAlign: 'center', marginTop: Spacing.xs }]}>
                      Ajoutez des séances pour structurer votre programme
                    </Text>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => router.push(`/program/${program.id}/add-session`)}
                      style={{ marginTop: Spacing.md }}
                    >
                      ➕ Ajouter une séance
                    </Button>
                  </View>
                ) : (
                  <View style={styles.sessionsList}>
                    {sessions.map((session, index) => (
                      <View
                        key={`${session.id}-${index}`}
                        style={[
                          styles.sessionItem,
                          { borderTopWidth: index > 0 ? 1 : 0, borderTopColor: colors.border }
                        ]}
                      >
                        <View style={styles.sessionInfo}>
                          <Text style={[TextStyles.bodyLarge, { color: colors.text }]}>
                            {session.name}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs }}>
                            <Badge
                              variant="neutral"
                              size="sm"
                              style={{
                                backgroundColor: SessionTypeColors[session.type]?.background || colors.backgroundTertiary,
                              }}
                            >
                              {session.type}
                            </Badge>
                            <Badge variant="info" size="sm">
                              Occurrence {session.orderIndex + 1}
                            </Badge>
                          </View>
                        </View>
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => handleRemoveSession(session)}
                          disabled={removingSessionId === session.id}
                          loading={removingSessionId === session.id}
                        >
                          🗑️
                        </Button>
                      </View>
                    ))}
                  </View>
                )}
              </CardContent>
            </Card>
          )}

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
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  editForm: {
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
  actionButtons: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  sessionsList: {
    gap: Spacing.sm,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
});
