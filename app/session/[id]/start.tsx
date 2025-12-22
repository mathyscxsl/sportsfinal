import { Button, Card, CardContent, LoadingSpinner, SafeAreaView } from '@/components/ui';
import { Layout, Spacing } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';
import { useSessionRunnerStore } from '@/hooks/useSessionRunnerStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { sessionExerciseRepository } from '@/services/repositories/SessionExerciseRepository';
import { sessionRepository } from '@/services/repositories/SessionRepository';
import type { Session } from '@/types/session.type';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function StartSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runner = useSessionRunnerStore();

  const current = useMemo(() => runner.exercises[runner.currentExerciseIndex], [runner.exercises, runner.currentExerciseIndex]);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const s = await sessionRepository.findById(parseInt(id));
        if (!s) {
          setError('Séance introuvable');
          return;
        }
        setSession(s);

        // pre-load exercises length to show immediate UI
        await sessionExerciseRepository.findBySessionIdWithExerciseDetails(s.id);
        await runner.initialize(s.id);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };
    load();

    return () => {
      // do not reset automatically to allow summary navigation to reuse data if needed
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const onFinish = async () => {
    const workoutId = await runner.finish();
    if (!workoutId) return;
    router.replace({ pathname: `/session/${id}/summary` as any, params: { workoutId: String(workoutId) } });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner message="Préparation de la séance..." />
      </SafeAreaView>
    );
  }

  if (error || !session) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Card variant="outlined">
            <CardContent>
              <Text style={[TextStyles.h4, { color: colors.error, marginBottom: Spacing.sm }]}>❌ Erreur</Text>
              <Text style={[TextStyles.body, { color: colors.textSecondary }]}>{error || 'Séance introuvable'}</Text>
            </CardContent>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header with session name and timer */}
        <View style={styles.header}>
          <Text style={[TextStyles.h3, { color: colors.text }]}>{session.name}</Text>
          {runner.mode === 'HIIT' ? (
            <View style={{ alignItems: 'center', marginTop: Spacing.sm }}>
              <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                {runner.phase === 'work' ? 'Travail' : runner.phase === 'rest' ? 'Repos' : ''}
              </Text>
              <Text style={[TextStyles.h1, { color: colors.primary }]}>
                {runner.phaseRemainingSeconds != null ? `${runner.phaseRemainingSeconds}s` : '--'}
              </Text>
              {runner.hiitTotalRemainingSeconds != null && (
                <Text style={[TextStyles.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  Temps restant: {formatTime(runner.hiitTotalRemainingSeconds)}
                </Text>
              )}
            </View>
          ) : runner.mode === 'EMOM' ? (
            <View style={{ alignItems: 'center', marginTop: Spacing.sm }}>
              <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>EMOM</Text>
              <Text style={[TextStyles.h1, { color: colors.primary }]}>
                {runner.emomRemainingSeconds != null ? `${runner.emomRemainingSeconds}s` : '--'}
              </Text>
              {runner.emomIntervalSeconds != null && (
                <Text style={[TextStyles.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  Intervalle: {runner.emomIntervalSeconds}s
                </Text>
              )}
            </View>
          ) : runner.mode === 'AMRAP' ? (
            <View style={{ alignItems: 'center', marginTop: Spacing.sm }}>
              <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>AMRAP</Text>
              <Text style={[TextStyles.h1, { color: colors.primary }]}>
                {runner.amrapTotalRemainingSeconds != null ? formatTime(runner.amrapTotalRemainingSeconds) : '--:--'}
              </Text>
            </View>
          ) : (
            <Text style={[TextStyles.timer, { color: colors.primary, marginTop: Spacing.sm }]}>
              {formatTime(runner.elapsedSeconds)}
            </Text>
          )}
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
            <Button variant={runner.status === 'running' ? 'outline' : 'primary'} onPress={runner.toggle}>
              {runner.status === 'running' ? '⏸️ Pause' : '▶️ Démarrer'}
            </Button>
            <Button variant="outline" onPress={() => {
              Alert.alert('Terminer la séance', 'Voulez-vous terminer et sauvegarder ?', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Terminer', style: 'destructive', onPress: onFinish },
              ]);
            }}>✅ Terminer</Button>
          </View>
        </View>

        {/* Current exercise */}
        {current ? (
          <Card variant="elevated" style={{ marginTop: Spacing.lg }}>
            <CardContent>
              <Text style={[TextStyles.h4, { color: colors.text }]}>
                Exercice {runner.currentExerciseIndex + 1}/{runner.exercises.length}
              </Text>
              <Text style={[TextStyles.h3, { color: colors.text, marginTop: Spacing.xs }]}>{current.name}</Text>

              <View style={{ flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.md, alignItems: 'center' }}>
                <Text style={[TextStyles.body, { color: colors.textSecondary }]}>Série: {current.currentSet}{current.setsTarget ? `/${current.setsTarget}` : ''}</Text>
                {runner.mode !== 'HIIT' && current.targetReps ? (
                  <Text style={[TextStyles.body, { color: colors.textSecondary }]}>Cible: {current.targetReps} reps</Text>
                ) : null}
              </View>

              {/* Controls vary per mode */}
              {runner.mode === 'DEFAULT' || runner.mode === 'AMRAP' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.lg }}>
                  <Button variant="outline" onPress={() => runner.addRep(-1)}>➖</Button>
                  <Text style={[TextStyles.h1, { color: colors.text }]}>{current.totalReps}</Text>
                  <Button variant="primary" onPress={() => runner.addRep(+1)}>➕</Button>
                </View>
              ) : (
                <View style={{ alignItems: 'center', marginTop: Spacing.lg }}>
                  <Text style={[TextStyles.caption, { color: colors.textSecondary }]}>
                    {runner.mode === 'HIIT' ? 'HIIT en cours — cycles travail/repos automatiques' : 'EMOM en cours — départ à chaque intervalle'}
                  </Text>
                </View>
              )}

              {(runner.mode === 'DEFAULT' || runner.mode === 'AMRAP') && (
                <Button fullWidth style={{ marginTop: Spacing.md }} onPress={runner.completeSet}>✅ Valider la série</Button>
              )}

              {/* Rest countdown if any */}
              {runner.status === 'rest' && runner.mode !== 'HIIT' && (
                <View style={{ marginTop: Spacing.md, alignItems: 'center' }}>
                  <Text style={[TextStyles.body, { color: colors.textSecondary }]}>Repos</Text>
                  <Text style={[TextStyles.h1, { color: colors.text }]}>{runner.restRemainingSeconds ?? 0}s</Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
                <Button variant="outline" onPress={runner.prevExercise} disabled={runner.currentExerciseIndex === 0 || runner.mode === 'HIIT' || runner.mode === 'EMOM'}>⬅️ Précédent</Button>
                <Button variant="outline" onPress={runner.nextExercise} disabled={runner.currentExerciseIndex >= runner.exercises.length - 1 || runner.mode === 'HIIT' || runner.mode === 'EMOM'}>Suivant ➡️</Button>
              </View>
            </CardContent>
          </Card>
        ) : (
          <Card variant="outlined" style={{ marginTop: Spacing.lg }}>
            <CardContent>
              <Text style={[TextStyles.body, { color: colors.textSecondary }]}>Aucun exercice dans cette séance</Text>
            </CardContent>
          </Card>
        )}

        <View style={{ height: Spacing.xxl }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Layout.screenPadding },
  header: { alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', padding: Layout.screenPadding },
});
