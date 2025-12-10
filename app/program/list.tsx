import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { programRepository } from '@/services/repositories/ProgramRepository';
import { ProgramCard } from '@/components/ProgramCard';
import { Button, LoadingSpinner, Card, CardContent, SafeAreaView } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';
import type { Program } from '@/types/program.type';

export default function ListPrograms() {
  const router = useRouter();
  const colors = useThemeColors();
  const [programs, setPrograms] = useState<(Program & { sessionCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await programRepository.findAllWithSessionCount();
      setPrograms(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner message="Chargement des programmes..." />
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
                onPress={loadPrograms}
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
        data={programs}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={[TextStyles.h2, { color: colors.text }]}>
                  Mes Programmes
                </Text>
                <Text style={[TextStyles.bodySmall, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  {programs.length} programme{programs.length > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <Button
              variant="primary"
              onPress={() => router.push('/program/create')}
              style={{ marginTop: Spacing.md }}
              fullWidth
            >
              ➕ Nouveau programme
            </Button>
          </View>
        }
        ListEmptyComponent={
          <Card variant="filled" style={{ marginTop: Spacing.lg }}>
            <CardContent style={styles.emptyState}>
              <Text style={[TextStyles.h3, { marginBottom: Spacing.sm }]}>📋</Text>
              <Text style={[TextStyles.h4, { color: colors.text, marginBottom: Spacing.xs }]}>
                Aucun programme
              </Text>
              <Text style={[TextStyles.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                Créez votre premier programme d&#39;entraînement pour organiser vos séances
              </Text>
              <Button
                variant="secondary"
                onPress={() => router.push('/program/create')}
                style={{ marginTop: Spacing.md }}
              >
                Créer un programme
              </Button>
            </CardContent>
          </Card>
        }
        renderItem={({ item }) => (
          <ProgramCard
            program={item}
            onPress={() => router.push(`/program/${item.id}`)}
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
