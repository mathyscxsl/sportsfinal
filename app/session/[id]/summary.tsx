import { Button, Card, CardContent, LoadingSpinner, SafeAreaView } from '@/components/ui';
import { Layout, Spacing } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';
import { useThemeColors } from '@/hooks/useThemeColors';
import { sessionExerciseRepository } from '@/services/repositories/SessionExerciseRepository';
import { sessionRepository } from '@/services/repositories/SessionRepository';
import { workoutExerciseRepository } from '@/services/repositories/WorkoutExerciseRepository';
import { workoutRepository } from '@/services/repositories/WorkoutRepository';
import { workoutSetRepository } from '@/services/repositories/WorkoutSetRepository';
import type { Workout } from '@/types/workout.type';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

type Row = { id: number; name: string; totalReps?: number | null; totalDurationSeconds?: number | null; setsCount?: number };

export default function SessionSummaryScreen() {
  const { id, workoutId } = useLocalSearchParams<{ id: string; workoutId?: string }>();
  const colors = useThemeColors();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [sessionName, setSessionName] = useState('Séance');
  const [sessionType, setSessionType] = useState<'AMRAP' | 'HIIT' | 'EMOM' | 'CUSTOM' | undefined>(undefined);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const wid = workoutId ? parseInt(workoutId) : undefined;
        let wo: Workout | null = null;
        if (wid) {
          wo = await workoutRepository.findById(wid);
        } else if (id) {
          wo = await workoutRepository.findLastBySessionId(parseInt(id));
        }
        if (!wo) { setLoading(false); return; }
        setWorkout(wo);
        let namesBySessionExerciseId: Record<number, string> = {};
        if (wo.sessionId) {
          const s = await sessionRepository.findById(wo.sessionId);
          if (s) { setSessionName(s.name); setSessionType(s.type); }
          const sesEx = await sessionExerciseRepository.findBySessionIdWithExerciseDetails(wo.sessionId);
          for (const se of sesEx) {
            const nm = se.customName || se.exercise?.name || `Exercice ${se.orderIndex + 1}`;
            namesBySessionExerciseId[se.id] = nm;
          }
        }
        const wexs = await workoutExerciseRepository.findByWorkoutId(wo.id);
        const built: Row[] = [];
        for (let i = 0; i < wexs.length; i++) {
          const x = wexs[i];
          const sets = await workoutSetRepository.findByWorkoutExerciseId(x.id);
          built.push({
            id: x.id,
            name: (x.sessionExerciseId && namesBySessionExerciseId[x.sessionExerciseId]) || `Exercice ${i + 1}`,
            totalReps: x.totalReps,
            totalDurationSeconds: x.totalDurationSeconds,
            setsCount: sets.length,
          });
        }
        setRows(built);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, workoutId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner message="Calcul des statistiques..." />
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Card variant="outlined"><CardContent>
            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>Aucun résultat à afficher.</Text>
          </CardContent></Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[TextStyles.h2, { color: colors.text }]}>{sessionName} — Récapitulatif</Text>

        <Card variant="elevated" style={{ marginTop: Spacing.md }}>
          <CardContent>
            <Text style={[TextStyles.h4, { color: colors.text }]}>Synthèse</Text>
            <View style={{ marginTop: Spacing.sm }}>
              <Text style={[TextStyles.body, { color: colors.textSecondary }]}>Temps total: {workout.totalTimeSeconds ?? 0}s</Text>
              <Text style={[TextStyles.body, { color: colors.textSecondary }]}>Terminé: {workout.completed ? 'Oui' : 'Non'}</Text>
            </View>
          </CardContent>
        </Card>

        <Card variant="elevated" style={{ marginTop: Spacing.md }}>
          <CardContent>
            <Text style={[TextStyles.h4, { color: colors.text, marginBottom: Spacing.sm }]}>Par exercice</Text>
            <FlatList
              data={rows}
              keyExtractor={(item) => String(item.id)}
              ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
              renderItem={({ item }) => (
                <View style={{ paddingVertical: Spacing.xs }}>
                  <Text style={[TextStyles.labelLarge, { color: colors.text }]}>{item.name}</Text>
                  {sessionType === 'HIIT' && (
                    <>
                      <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Intervalles: {item.setsCount ?? 0}</Text>
                      {item.totalDurationSeconds ? (
                        <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Durée travail: {item.totalDurationSeconds}s</Text>
                      ) : null}
                    </>
                  )}
                  {sessionType === 'EMOM' && (
                    <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Intervalles réalisés: {item.setsCount ?? 0}</Text>
                  )}
                  {(sessionType === 'AMRAP' || sessionType === 'CUSTOM') && (
                    <>
                      <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Répétitions: {item.totalReps ?? 0}</Text>
                      {item.totalDurationSeconds ? (
                        <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>Durée: {item.totalDurationSeconds}s</Text>
                      ) : null}
                    </>
                  )}
                </View>
              )}
            />
          </CardContent>
        </Card>

        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
          <Button variant="primary" onPress={() => router.replace('/session/list')}>⬅️ Retour aux séances</Button>
          <Button variant="outline" onPress={() => router.replace(`/session/${workout.sessionId}` as any)}>Détail de la séance</Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Layout.screenPadding },
  center: { flex: 1, justifyContent: 'center', padding: Layout.screenPadding },
});
