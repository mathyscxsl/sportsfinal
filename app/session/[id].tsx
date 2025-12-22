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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

type SessionExerciseWithDetails = {
  id: number;
  sessionId: number;
  exerciseId?: number | null;
  customName?: string | null;
  orderIndex: number;
  sets?: number | null;
  targetReps?: number | null;
  targetDurationSeconds?: number | null;
  restSecondsBetweenSets?: number | null;
  workSeconds?: number | null;
  restSeconds?: number | null;
  emomIntervalSeconds?: number | null;
  notes?: string | null;
  exercise?: {
    id: number;
    name: string;
    category: string;
    description: string;
  } | null;
};

export default function SessionDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [session, setSession] = useState<Session | null>(null);
  const [exercises, setExercises] = useState<SessionExerciseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const sessionData = await sessionRepository.findById(parseInt(id));
      if (!sessionData) {
        setError("Séance non trouvée");
        return;
      }

      setSession(sessionData);

      const exerciseData =
        await sessionExerciseRepository.findBySessionIdWithExerciseDetails(
          parseInt(id)
        );
      setExercises(exerciseData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    Alert.alert(
      "Supprimer la séance",
      "Êtes-vous sûr de vouloir supprimer cette séance ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await sessionRepository.delete(parseInt(id));
              Alert.alert("✅ Succès", "Séance supprimée", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (err) {
              Alert.alert(
                "❌ Erreur",
                err instanceof Error ? err.message : "Erreur inconnue"
              );
            }
          },
        },
      ]
    );
  };

  const getSessionTypeLabel = (type: Session["type"]): string => {
    switch (type) {
      case "AMRAP":
        return "AMRAP";
      case "HIIT":
        return "HIIT";
      case "EMOM":
        return "EMOM";
      case "CUSTOM":
        return "Personnalisé";
      default:
        return type;
    }
  };

  const getExerciseName = (ex: SessionExerciseWithDetails): string => {
    return ex.customName || ex.exercise?.name || "Exercice inconnu";
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LoadingSpinner message="Chargement..." />
      </SafeAreaView>
    );
  }

  if (error || !session) {
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
                {error || "Séance non trouvée"}
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[TextStyles.h2, { color: colors.text }]}>
            {session.name}
          </Text>
          <View
            style={{
              backgroundColor: colors.primaryLight,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.xs,
              borderRadius: 12,
              alignSelf: "flex-start",
              marginTop: Spacing.sm,
            }}
          >
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              {getSessionTypeLabel(session.type)}
            </Text>
          </View>
        </View>

        {/* Informations */}
        <Card variant="elevated">
          <CardContent>
            <Text
              style={[
                TextStyles.h4,
                { color: colors.text, marginBottom: Spacing.md },
              ]}
            >
              Informations
            </Text>

            <View style={styles.infoRow}>
              <Text style={[TextStyles.label, { color: colors.textSecondary }]}>
                Type :
              </Text>
              <Text style={[TextStyles.body, { color: colors.text }]}>
                {getSessionTypeLabel(session.type)}
              </Text>
            </View>

            {session.plannedAt && (
              <View style={styles.infoRow}>
                <Text
                  style={[TextStyles.label, { color: colors.textSecondary }]}
                >
                  Planifié :
                </Text>
                <Text style={[TextStyles.body, { color: colors.text }]}>
                  {new Date(session.plannedAt).toLocaleString("fr-FR")}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={[TextStyles.label, { color: colors.textSecondary }]}>
                Notifications :
              </Text>
              <Text style={[TextStyles.body, { color: colors.text }]}>
                {session.notificationEnabled ? "🔔 Activées" : "🔕 Désactivées"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[TextStyles.label, { color: colors.textSecondary }]}>
                Créée le :
              </Text>
              <Text style={[TextStyles.body, { color: colors.text }]}>
                {new Date(session.createdAt).toLocaleDateString("fr-FR")}
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Exercices */}
        <Card variant="elevated" style={{ marginTop: Spacing.md }}>
          <CardContent>
            <Text
              style={[
                TextStyles.h4,
                { color: colors.text, marginBottom: Spacing.md },
              ]}
            >
              Exercices ({exercises.length})
            </Text>

            {exercises.length === 0 ? (
              <View
                style={[
                  styles.emptyState,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <Text
                  style={[
                    TextStyles.body,
                    { color: colors.textSecondary, textAlign: "center" },
                  ]}
                >
                  Aucun exercice configuré
                </Text>
              </View>
            ) : (
              <View style={styles.exercisesList}>
                {exercises.map((ex, index) => (
                  <View
                    key={ex.id}
                    style={[
                      styles.exerciseItem,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    <Text
                      style={[TextStyles.labelLarge, { color: colors.text }]}
                    >
                      {index + 1}. {getExerciseName(ex)}
                    </Text>

                    <View style={styles.exerciseDetails}>
                      {ex.sets && (
                        <Text
                          style={[
                            TextStyles.caption,
                            { color: colors.textSecondary },
                          ]}
                        >
                          📊 {ex.sets} série{ex.sets > 1 ? "s" : ""}
                        </Text>
                      )}
                      {ex.targetReps && (
                        <Text
                          style={[
                            TextStyles.caption,
                            { color: colors.textSecondary },
                          ]}
                        >
                          🔢 {ex.targetReps} répétitions
                        </Text>
                      )}
                      {ex.targetDurationSeconds && (
                        <Text
                          style={[
                            TextStyles.caption,
                            { color: colors.textSecondary },
                          ]}
                        >
                          ⏱️ {ex.targetDurationSeconds}s
                        </Text>
                      )}
                      {ex.restSecondsBetweenSets && (
                        <Text
                          style={[
                            TextStyles.caption,
                            { color: colors.textSecondary },
                          ]}
                        >
                          😌 Repos: {ex.restSecondsBetweenSets}s
                        </Text>
                      )}
                    </View>

                    {ex.notes && (
                      <Text
                        style={[
                          TextStyles.caption,
                          {
                            color: colors.textSecondary,
                            marginTop: Spacing.xs,
                            fontStyle: "italic",
                          },
                        ]}
                      >
                        💡 {ex.notes}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            variant="primary"
            fullWidth
            onPress={() => router.push(`/session/${id}/start` as any)}
          >
            ▶️ Démarrer la séance
          </Button>
          <Button
            variant="outline"
            fullWidth
            onPress={handleDelete}
            style={{ marginTop: Spacing.md }}
          >
            🗑️ Supprimer
          </Button>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Layout.screenPadding,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  exercisesList: {
    gap: Spacing.sm,
  },
  exerciseItem: {
    padding: Spacing.md,
    borderRadius: 8,
  },
  exerciseDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  emptyState: {
    padding: Spacing.lg,
    borderRadius: 8,
  },
  actions: {
    marginTop: Spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    padding: Layout.screenPadding,
  },
});
