import { SessionCard } from "@/components/SessionCard";
import {
  Button,
  Card,
  CardContent,
  LoadingSpinner,
  SafeAreaView,
} from "@/components/ui";
import { Layout, Spacing } from "@/constants/Spacing";
import { TextStyles } from "@/constants/Typography";
import { useThemeColors } from "@/hooks/useThemeColors";
import { sessionExerciseRepository } from "@/services/repositories/SessionExerciseRepository";
import { sessionRepository } from "@/services/repositories/SessionRepository";
import type { Session } from "@/types/session.type";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

type SessionWithExerciseCount = Session & {
  exerciseCount: number;
};

export default function ListSessions() {
  const router = useRouter();
  const colors = useThemeColors();
  const [sessions, setSessions] = useState<SessionWithExerciseCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionRepository.findAll();

      // Charger le nombre d'exercices pour chaque session
      const sessionsWithCount = await Promise.all(
        data.map(async (session) => {
          const exerciseCount =
            await sessionExerciseRepository.countBySessionId(session.id);
          return {
            ...session,
            exerciseCount,
          };
        })
      );

      setSessions(sessionsWithCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LoadingSpinner message="Chargement des séances..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Card variant="outlined">
            <CardContent>
              <Text
                style={[
                  TextStyles.h4,
                  { color: colors.error, marginBottom: Spacing.sm },
                ]}
              >
                ❌ Erreur
              </Text>
              <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
                {error}
              </Text>
              <Button
                variant="outline"
                onPress={loadSessions}
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={[TextStyles.h2, { color: colors.text }]}>
                  Séances
                </Text>
                <Text
                  style={[
                    TextStyles.bodySmall,
                    { color: colors.textSecondary, marginTop: Spacing.xs },
                  ]}
                >
                  {sessions.length} séance{sessions.length > 1 ? "s" : ""} créée
                  {sessions.length > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
            <Button
              variant="primary"
              onPress={() => router.push("/session/create")}
              style={{ marginTop: Spacing.md }}
              fullWidth
            >
              ➕ Nouvelle séance
            </Button>
          </View>
        }
        ListEmptyComponent={
          <Card variant="filled" style={{ marginTop: Spacing.lg }}>
            <CardContent style={styles.emptyState}>
              <Text
                style={[
                  TextStyles.h4,
                  { color: colors.text, textAlign: "center" },
                ]}
              >
                🏋️ Aucune séance
              </Text>
              <Text
                style={[
                  TextStyles.body,
                  {
                    color: colors.textSecondary,
                    textAlign: "center",
                    marginTop: Spacing.sm,
                  },
                ]}
              >
                Créez votre première séance d'entraînement pour commencer
              </Text>
            </CardContent>
          </Card>
        }
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onPress={() => router.push(`/session/${item.id}` as any)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  emptyState: {
    paddingVertical: Spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    padding: Layout.screenPadding,
  },
});
