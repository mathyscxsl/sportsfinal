import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { sessionRepository } from '@/services/repositories/SessionRepository';
import { sessionExerciseRepository } from '@/services/repositories/SessionExerciseRepository';
import { programRepository } from '@/services/repositories/ProgramRepository';
import { programSessionRepository } from '@/services/repositories/ProgramSessionRepository';
import { Button, LoadingSpinner, Card, CardContent, SafeAreaView, Badge } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';
import { SessionTypeColors } from '@/constants/Colors';
import type { Session } from '@/types/session.type';

type SessionWithExerciseCount = Session & {
  exerciseCount: number;
  isInCurrentProgram: boolean;
};

export default function AddSessionToProgram() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const [sessions, setSessions] = useState<SessionWithExerciseCount[]>([]);
  const [programName, setProgramName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingSessionId, setAddingSessionId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger le nom du programme
      const program = await programRepository.findById(Number(id));
      if (program) {
        setProgramName(program.name);
      }

      // Charger toutes les séances
      const allSessions = await sessionRepository.findAll();

      // Charger les sessions déjà dans ce programme
      const sessionIdsInProgram = await programSessionRepository.getSessionIdsByProgramId(Number(id));

      // Charger le nombre d'exercices pour chaque session
      const sessionsWithCount = await Promise.all(
        allSessions.map(async (session) => {
          const exerciseCount = await sessionExerciseRepository.countBySessionId(session.id);
          return {
            ...session,
            exerciseCount,
            isInCurrentProgram: sessionIdsInProgram.includes(session.id),
          };
        })
      );

      setSessions(sessionsWithCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddSession = async (session: SessionWithExerciseCount) => {
    if (session.isInCurrentProgram) {
      // Si la séance est déjà dans le programme, demander confirmation pour l'ajouter quand même
      Alert.alert(
        'Séance déjà dans le programme',
        `La séance "${session.name}" est déjà dans ce programme. Voulez-vous l'ajouter une nouvelle fois ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Ajouter quand même',
            onPress: () => performAddSession(session)
          }
        ]
      );
    } else {
      performAddSession(session);
    }
  };

  const performAddSession = async (session: SessionWithExerciseCount) => {
    setAddingSessionId(session.id);
    try {
      await programSessionRepository.addSessionToProgram(Number(id), session.id);

      Alert.alert('✅ Succès', 'Séance ajoutée au programme', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      Alert.alert('❌ Erreur', err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setAddingSessionId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner message="Chargement des séances..." />
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
                Erreur
              </Text>
              <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
                {error}
              </Text>
              <Button
                variant="outline"
                onPress={loadData}
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
        data={sessions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[TextStyles.h2, { color: colors.text }]}>
              Ajouter une séance
            </Text>
            <Text style={[TextStyles.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
              au programme &#34;{programName}&#34;
            </Text>

            {/* Bouton créer nouvelle séance */}
            <Button
              variant="primary"
              onPress={() => router.push(`/session/create?programId=${id}`)}
              style={{ marginTop: Spacing.md }}
              fullWidth
            >
              ➕ Créer une nouvelle séance
            </Button>
          </View>
        }
        ListEmptyComponent={
          <Card variant="filled" style={{ marginTop: Spacing.lg }}>
            <CardContent style={styles.emptyState}>
              <Text style={[TextStyles.h3, { marginBottom: Spacing.sm }]}>🏋️</Text>
              <Text style={[TextStyles.h4, { color: colors.text, marginBottom: Spacing.xs }]}>
                Aucune séance disponible
              </Text>
              <Text style={[TextStyles.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                Créez votre première séance pour commencer
              </Text>
              <Button
                variant="secondary"
                onPress={() => router.push(`/session/create?programId=${id}`)}
                style={{ marginTop: Spacing.md }}
              >
                Créer une séance
              </Button>
            </CardContent>
          </Card>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleAddSession(item)}
            activeOpacity={0.7}
            disabled={addingSessionId === item.id}
          >
            <Card variant="elevated">
              <CardContent>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionInfo}>
                    <Text style={[TextStyles.h4, { color: colors.text }]}>
                      {item.name}
                    </Text>
                    <View style={styles.sessionMeta}>
                      <Badge
                        variant="neutral"
                        size="sm"
                        style={{
                          backgroundColor: SessionTypeColors[item.type]?.background || colors.backgroundTertiary,
                        }}
                      >
                        {item.type}
                      </Badge>
                      <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                        {item.exerciseCount} exercice{item.exerciseCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    {item.isInCurrentProgram && (
                      <Text style={[TextStyles.caption, { color: colors.success, marginTop: Spacing.xs }]}>
                        ✓ Déjà dans ce programme
                      </Text>
                    )}
                  </View>
                  <Button
                    variant={item.isInCurrentProgram ? 'ghost' : 'secondary'}
                    size="sm"
                    onPress={() => handleAddSession(item)}
                    disabled={addingSessionId === item.id || item.isInCurrentProgram}
                    loading={addingSessionId === item.id}
                  >
                    {item.isInCurrentProgram ? '✓' : '+ Ajouter'}
                  </Button>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>
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
  divider: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    alignItems: 'center',
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
