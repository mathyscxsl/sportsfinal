import type { SelectOption } from "@/components/ui";
import { Button, Card, CardContent, Input, SafeAreaView, Select, } from "@/components/ui";
import { Layout, Spacing } from "@/constants/Spacing";
import { TextStyles } from "@/constants/Typography";
import { useThemeColors } from "@/hooks/useThemeColors";
import { exerciseRepository } from "@/services/repositories/ExerciseRepository";
import { programSessionRepository } from "@/services/repositories/ProgramSessionRepository";
import { sessionExerciseRepository } from "@/services/repositories/SessionExerciseRepository";
import { sessionRepository } from "@/services/repositories/SessionRepository";
import type { Exercise, ExerciseCategory } from "@/types/exercise.type";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import * as yup from "yup";

// Schéma de validation Yup
const sessionSchema = yup.object({
  name: yup
    .string()
    .required("Le nom est obligatoire")
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  type: yup
    .string()
    .required("Le type est obligatoire")
    .oneOf(["AMRAP", "HIIT", "EMOM", "CUSTOM"], "Type invalide"),
});

type SessionFormValues = {
  name: string;
  type: "AMRAP" | "HIIT" | "EMOM" | "CUSTOM";
  // Paramètres au niveau de la séance selon le type
  amrapDurationSeconds?: string;
  hiitWorkSeconds?: string;
  hiitRestSeconds?: string;
  hiitTotalDurationSeconds?: string;
  emomIntervalSeconds?: string;
};

type SessionExerciseForm = {
  exerciseId: number | null;
  customName: string;
  orderIndex: number;
  sets?: number;
  targetReps?: number;
  targetDurationSeconds?: number;
  restSecondsBetweenSets?: number;
  workSeconds?: number;
  restSeconds?: number;
  emomIntervalSeconds?: number;
  notes?: string;
};

export default function CreateSession() {
  const router = useRouter();
  const { programId } = useLocalSearchParams<{ programId?: string }>();
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sessionExercises, setSessionExercises] = useState<
    SessionExerciseForm[]
  >([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await exerciseRepository.findAll();
      setExercises(data);
    } catch (err) {
      console.error("Erreur lors du chargement des exercices:", err);
    }
  };

  const initialValues: SessionFormValues = {
    name: "",
    type: "CUSTOM",
    amrapDurationSeconds: "",
    hiitWorkSeconds: "",
    hiitRestSeconds: "",
    hiitTotalDurationSeconds: "",
    emomIntervalSeconds: "",
  };

  const handleSubmit = async (values: SessionFormValues) => {
    if (sessionExercises.length === 0) {
      Alert.alert(
        "⚠️ Attention",
        "Veuillez ajouter au moins un exercice à la séance"
      );
      return;
    }

    setLoading(true);
    try {
      // Sérialiser la configuration spécifique au type dans repeat_rule (JSON)
      let repeatRule: string | undefined = undefined;
      if (values.type === "HIIT") {
        const work = values.hiitWorkSeconds ? parseInt(values.hiitWorkSeconds) : undefined;
        const rest = values.hiitRestSeconds ? parseInt(values.hiitRestSeconds) : undefined;
        const total = values.hiitTotalDurationSeconds ? parseInt(values.hiitTotalDurationSeconds) : undefined;
        repeatRule = JSON.stringify({ typeConfig: { hiit: { workSeconds: work, restSeconds: rest, totalDurationSeconds: total } } });
      } else if (values.type === "EMOM") {
        const interval = values.emomIntervalSeconds ? parseInt(values.emomIntervalSeconds) : undefined;
        repeatRule = JSON.stringify({ typeConfig: { emom: { intervalSeconds: interval } } });
      } else if (values.type === "AMRAP") {
        const duration = values.amrapDurationSeconds ? parseInt(values.amrapDurationSeconds) : undefined;
        repeatRule = JSON.stringify({ typeConfig: { amrap: { durationSeconds: duration } } });
      }

      const session = await sessionRepository.create({
        name: values.name.trim(),
        type: values.type,
        notificationEnabled: 0,
        repeatRule,
      });

      // Ajouter les exercices à la session
      for (const exercise of sessionExercises) {
        await sessionExerciseRepository.create({
          sessionId: session.id,
          exerciseId: exercise.exerciseId ?? undefined,
          orderIndex: exercise.orderIndex,
          // Pour HIIT/EMOM, on ne renseigne pas les séries ni le repos au niveau exercice
          sets: values.type === "HIIT" || values.type === 'EMOM' ? undefined : exercise.sets,
          targetReps: values.type === "HIIT" ? undefined : exercise.targetReps,
          // AMRAP peut utiliser une durée cible au niveau exercice si souhaité
          targetDurationSeconds: values.type === "AMRAP" ? exercise.targetDurationSeconds : undefined,
          restSecondsBetweenSets: values.type === "HIIT" || values.type === 'EMOM' ? undefined : exercise.restSecondsBetweenSets,
          workSeconds: undefined,
          restSeconds: undefined,
          emomIntervalSeconds: values.type === "EMOM" ? exercise.emomIntervalSeconds : undefined,
          notes: exercise.notes,
        });
      }

      // Si un programId est fourni, ajouter la séance au programme via la table de jonction
      if (programId) {
        await programSessionRepository.addSessionToProgram(parseInt(programId), session.id);
      }

      const successMessage = programId
        ? "Séance créée et ajoutée au programme avec succès"
        : "Séance créée avec succès";

      Alert.alert("✅ Succès", successMessage, [
        {
          text: "OK",
          onPress: () => {
            if (programId) {
              router.replace(`/program/${programId}` as any);
            } else {
              router.back();
            }
          },
        },
      ]);
    } catch (err) {
      Alert.alert(
        "❌ Erreur",
        err instanceof Error ? err.message : "Erreur inconnue"
      );
    } finally {
      setLoading(false);
    }
  };

  const sessionTypes: SelectOption[] = [
    { label: "Personnalisé", value: "CUSTOM" },
    { label: "AMRAP (As Many Rounds As Possible)", value: "AMRAP" },
    { label: "HIIT (High Intensity Interval Training)", value: "HIIT" },
    { label: "EMOM (Every Minute On the Minute)", value: "EMOM" },
  ];

  const addExercise = (exercise: SessionExerciseForm) => {
    setSessionExercises([
      ...sessionExercises,
      { ...exercise, orderIndex: sessionExercises.length },
    ]);
    setShowExerciseForm(false);
  };

  const removeExercise = (index: number) => {
    const newExercises = sessionExercises.filter((_, i) => i !== index);
    // Réorganiser les indices
    const reindexed = newExercises.map((ex, i) => ({ ...ex, orderIndex: i }));
    setSessionExercises(reindexed);
  };

  const moveExercise = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sessionExercises.length) return;

    const newExercises = [...sessionExercises];
    const [removed] = newExercises.splice(fromIndex, 1);
    newExercises.splice(toIndex, 0, removed);

    // Réorganiser les indices
    const reindexed = newExercises.map((ex, i) => ({ ...ex, orderIndex: i }));
    setSessionExercises(reindexed);
  };

  const getExerciseName = (ex: SessionExerciseForm): string => {
    const exercise = exercises.find((e) => e.id === ex.exerciseId);
    return exercise?.name || "Exercice inconnu";
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[TextStyles.h2, { color: colors.text }]}>
              Nouvelle séance
            </Text>
            <Text
              style={[
                TextStyles.body,
                { color: colors.textSecondary, marginTop: Spacing.xs },
              ]}
            >
              {programId
                ? "Créez une séance pour votre programme"
                : "Créez une séance d'entraînement personnalisée"}
            </Text>
            {programId && (
              <View
                style={[
                  styles.programBadge,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Text
                  style={[TextStyles.caption, { color: colors.primary }]}
                >
                  📋 Sera ajoutée au programme
                </Text>
              </View>
            )}
          </View>

          <Formik
            initialValues={initialValues}
            validationSchema={sessionSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <View>
                {/* Informations de base */}
                <Card variant="elevated">
                  <CardContent>
                    <Text
                      style={[
                        TextStyles.h3,
                        { color: colors.text, marginBottom: Spacing.md },
                      ]}
                    >
                      Informations
                    </Text>

                    {/* Nom */}
                    <Input
                      label="Nom de la séance *"
                      placeholder="Ex: Full Body, Cardio..."
                      value={values.name}
                      onChangeText={handleChange("name")}
                      onBlur={handleBlur("name")}
                      error={
                        touched.name && errors.name ? errors.name : undefined
                      }
                      autoCapitalize="sentences"
                    />

                    {/* Type */}
                    <Select
                      label="Type de séance *"
                      value={values.type}
                      options={sessionTypes}
                      onValueChange={(itemValue) =>
                        setFieldValue("type", itemValue)
                      }
                      placeholder="Sélectionner un type"
                    />

                    {/* Description du type */}
                    {values.type && (
                      <View
                        style={[
                          styles.typeDescription,
                          { backgroundColor: colors.backgroundSecondary },
                        ]}
                      >
                        <Text
                          style={[
                            TextStyles.caption,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {values.type === "AMRAP" &&
                            "⏱️ Réalisez autant de tours que possible dans un temps donné"}
                          {values.type === "HIIT" &&
                            "🔥 Alternance entre effort intense et repos"}
                          {values.type === "EMOM" &&
                            "⏰ Répétitions au début de chaque minute"}
                          {values.type === "CUSTOM" &&
                            "✨ Séance personnalisée selon vos besoins"}
                        </Text>
                      </View>
                    )}
                  </CardContent>
                </Card>

                {/* Liste des exercices */}
                <Card variant="elevated" style={{ marginTop: Spacing.md }}>
                  <CardContent>
                    <View style={styles.exercisesHeader}>
                      <Text style={[TextStyles.h3, { color: colors.text }]}>
                        Exercices ({sessionExercises.length})
                      </Text>
                      <Button
                        variant="primary"
                        size="sm"
                        onPress={() => setShowExerciseForm(true)}
                      >
                        + Ajouter
                      </Button>
                    </View>

                    {sessionExercises.length === 0 ? (
                      <View
                        style={[
                          styles.emptyState,
                          { backgroundColor: colors.backgroundSecondary },
                        ]}
                      >
                        <Text
                          style={[
                            TextStyles.body,
                            {
                              color: colors.textSecondary,
                              textAlign: "center",
                            },
                          ]}
                        >
                          Aucun exercice ajouté.{"\n"}
                          Commencez par ajouter un exercice à votre séance.
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.exercisesList}>
                        {sessionExercises.map((ex, index) => (
                          <View
                            key={index}
                            style={[
                              styles.exerciseItem,
                              { backgroundColor: colors.backgroundSecondary },
                            ]}
                          >
                            <View style={styles.exerciseInfo}>
                              <Text
                                style={[
                                  TextStyles.labelLarge,
                                  { color: colors.text },
                                ]}
                              >
                                {index + 1}. {getExerciseName(ex)}
                              </Text>
                              <View style={styles.exerciseDetails}>
                                {values.type === 'CUSTOM' && ex.sets && (
                                  <Text
                                    style={[
                                      TextStyles.caption,
                                      { color: colors.textSecondary },
                                    ]}
                                  >
                                    {ex.sets} série{ex.sets > 1 ? "s" : ""}
                                  </Text>
                                )}
                                {(values.type === 'CUSTOM' || values.type === 'EMOM') && ex.targetReps && (
                                  <Text
                                    style={[
                                      TextStyles.caption,
                                      { color: colors.textSecondary },
                                    ]}
                                  >
                                    • {ex.targetReps} reps
                                  </Text>
                                )}
                                {values.type === 'AMRAP' && ex.targetDurationSeconds && (
                                  <Text
                                    style={[
                                      TextStyles.caption,
                                      { color: colors.textSecondary },
                                    ]}
                                  >
                                    • {ex.targetDurationSeconds}s
                                  </Text>
                                )}
                              </View>
                            </View>

                            <View style={styles.exerciseActions}>
                              {index > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onPress={() => moveExercise(index, index - 1)}
                                >
                                  ↑
                                </Button>
                              )}
                              {index < sessionExercises.length - 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onPress={() => moveExercise(index, index + 1)}
                                >
                                  ↓
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onPress={() => removeExercise(index)}
                              >
                                🗑️
                              </Button>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </CardContent>
                </Card>

                {/* Paramètres du type de séance */}
                <Card variant="elevated" style={{ marginTop: Spacing.md }}>
                  <CardContent>
                    <Text style={[TextStyles.h3, { color: colors.text, marginBottom: Spacing.md }]}>Paramètres du type</Text>
                    {values.type === 'HIIT' && (
                      <View>
                        <View style={styles.formRow}>
                          <Input
                            label="Temps de travail (s)"
                            placeholder="30"
                            value={values.hiitWorkSeconds}
                            onChangeText={(t) => setFieldValue('hiitWorkSeconds', t)}
                            keyboardType="number-pad"
                            containerStyle={styles.formInput}
                          />
                          <Input
                            label="Temps de repos (s)"
                            placeholder="30"
                            value={values.hiitRestSeconds}
                            onChangeText={(t) => setFieldValue('hiitRestSeconds', t)}
                            keyboardType="number-pad"
                            containerStyle={styles.formInput}
                          />
                        </View>
                        <Input
                          label="Durée totale (s)"
                          placeholder="600"
                          value={values.hiitTotalDurationSeconds}
                          onChangeText={(t) => setFieldValue('hiitTotalDurationSeconds', t)}
                          keyboardType="number-pad"
                          containerStyle={{ marginTop: Spacing.sm }}
                        />
                      </View>
                    )}
                    {values.type === 'EMOM' && (
                      <Input
                        label="Intervalle EMOM (s)"
                        placeholder="60"
                        value={values.emomIntervalSeconds}
                        onChangeText={(t) => setFieldValue('emomIntervalSeconds', t)}
                        keyboardType="number-pad"
                      />
                    )}
                    {values.type === 'AMRAP' && (
                      <Input
                        label="Durée AMRAP (s)"
                        placeholder="600"
                        value={values.amrapDurationSeconds}
                        onChangeText={(t) => setFieldValue('amrapDurationSeconds', t)}
                        keyboardType="number-pad"
                      />
                    )}
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
                    disabled={loading || sessionExercises.length === 0}
                  >
                    Créer la séance
                  </Button>
                </View>

                {/* Modal pour ajouter un exercice (dépend du type de séance) */}
                {showExerciseForm && (
                  <ExerciseFormModal
                    exercises={exercises}
                    onAdd={addExercise}
                    onCancel={() => setShowExerciseForm(false)}
                    onExerciseCreated={loadExercises}
                    sessionType={values.type}
                  />
                )}
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

// Composant modal pour ajouter un exercice
function ExerciseFormModal({
  exercises,
  onAdd,
  onCancel,
  onExerciseCreated,
  sessionType,
}: {
  exercises: Exercise[];
  onAdd: (exercise: SessionExerciseForm) => void;
  onCancel: () => void;
  onExerciseCreated?: () => void;
  sessionType: SessionFormValues['type'];
}) {
  const colors = useThemeColors();
  const [exerciseId, setExerciseId] = useState<number | null>(null);
  const [customName, setCustomName] = useState("");
  const [category, setCategory] = useState<ExerciseCategory | "">("");
  const [description, setDescription] = useState("");
  const [sets, setSets] = useState("3");
  const [targetReps, setTargetReps] = useState("10");
  const [restSeconds, setRestSeconds] = useState("60");
  const [loading, setLoading] = useState(false);

  const exerciseOptions: SelectOption[] = [
    { label: "Exercice personnalisé", value: "0" },
    ...exercises.map((e) => ({ label: e.name, value: e.id.toString() })),
  ];

  const categories: SelectOption[] = [
    { label: "Aucune", value: "" },
    { label: "Cardio", value: "cardio" },
    { label: "Force", value: "force" },
    { label: "Mobilité", value: "mobilité" },
    { label: "Autre", value: "autre" },
  ];

  const handleAdd = async () => {
    if (exerciseId === 0 && !customName.trim()) {
      Alert.alert(
        "⚠️ Attention",
        "Veuillez saisir un nom pour l'exercice personnalisé"
      );
      return;
    }

    if (exerciseId !== 0 && exerciseId === null) {
      Alert.alert("⚠️ Attention", "Veuillez sélectionner un exercice");
      return;
    }

    try {
      setLoading(true);

      let finalExerciseId = exerciseId === 0 ? null : exerciseId;

      // Si c'est un exercice personnalisé, le créer en base de données
      if (exerciseId === 0 && customName.trim()) {
        const newExercise = await exerciseRepository.create({
          name: customName.trim(),
          category: category || null,
          description: description.trim() || null,
          isCustom: true,
        });

        finalExerciseId = newExercise.id;

        // Notifier le parent pour recharger la liste des exercices
        if (onExerciseCreated) {
          onExerciseCreated();
        }
      }

      onAdd({
        exerciseId: finalExerciseId,
        customName: "",
        orderIndex: 0,
        sets: sessionType === 'HIIT' ? undefined : (sets ? parseInt(sets) : undefined),
        targetReps: sessionType === 'HIIT' ? undefined : (targetReps ? parseInt(targetReps) : undefined),
        restSecondsBetweenSets: sessionType === 'HIIT' ? undefined : (restSeconds ? parseInt(restSeconds) : undefined),
      });
    } catch (err) {
      Alert.alert(
        "❌ Erreur",
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de l'exercice"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
      <View
        style={[styles.modalContent, { backgroundColor: colors.background }]}
      >
        <Text
          style={[
            TextStyles.h3,
            { color: colors.text, marginBottom: Spacing.md },
          ]}
        >
          Ajouter un exercice
        </Text>

        <Select
          label="Exercice"
          value={exerciseId?.toString() || ""}
          options={exerciseOptions}
          onValueChange={(value) =>
            setExerciseId(value ? parseInt(value) : null)
          }
          placeholder="Sélectionner un exercice"
        />

        {exerciseId === 0 && (
          <>
            <Input
              label="Nom de l'exercice *"
              placeholder="Ex: Burpees"
              value={customName}
              onChangeText={setCustomName}
              containerStyle={{ marginTop: Spacing.sm }}
              autoCapitalize="sentences"
            />

            <Select
              label="Catégorie"
              value={category}
              options={categories}
              onValueChange={(itemValue) =>
                setCategory(itemValue as ExerciseCategory | "")
              }
              placeholder="Sélectionner une catégorie"
            />
            {category && (
              <View
                style={{
                  marginTop: Spacing.sm,
                  paddingHorizontal: Spacing.sm,
                  paddingVertical: Spacing.xs,
                  borderRadius: 12,
                  backgroundColor: colors.backgroundSecondary,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {categories.find((c) => c.value === category)?.label}
                </Text>
              </View>
            )}

            <Input
              label="Description"
              placeholder="Décrivez l'exercice, les muscles ciblés..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              containerStyle={{ marginTop: Spacing.sm }}
              style={{ height: 80, textAlignVertical: "top" }}
            />
          </>
        )}

        {/* Configuration de l'exercice */}
        <Text
          style={[
            TextStyles.label,
            {
              color: colors.text,
              marginTop: Spacing.md,
              marginBottom: Spacing.sm,
            },
          ]}
        >
          Configuration
        </Text>
        {sessionType === 'CUSTOM' && (
          <>
            <View style={styles.formRow}>
              <Input
                label="Séries"
                placeholder="3"
                value={sets}
                onChangeText={setSets}
                keyboardType="number-pad"
                containerStyle={styles.formInput}
              />
              <Input
                label="Répétitions"
                placeholder="10"
                value={targetReps}
                onChangeText={setTargetReps}
                keyboardType="number-pad"
                containerStyle={styles.formInput}
              />
            </View>

            <Input
              label="Repos entre séries (secondes)"
              placeholder="60"
              value={restSeconds}
              onChangeText={setRestSeconds}
              keyboardType="number-pad"
              containerStyle={{ marginTop: Spacing.sm }}
            />
          </>
        )}
        {sessionType === 'EMOM' && (
          <View style={styles.formRow}>
            <Input
              label="Répétitions"
              placeholder="10"
              value={targetReps}
              onChangeText={setTargetReps}
              keyboardType="number-pad"
              containerStyle={styles.formInput}
            />
          </View>
        )}

        <View style={styles.modalButtons}>
          <Button
            variant="outline"
            onPress={onCancel}
            style={styles.button}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onPress={handleAdd}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Ajouter
          </Button>
        </View>
      </View>
    </View>
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
  programBadge: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  typeDescription: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: 8,
  },
  exercisesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  emptyState: {
    padding: Spacing.lg,
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  exercisesList: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseDetails: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  exerciseActions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: Layout.screenPadding,
  },
  modalContent: {
    width: "100%",
    maxWidth: 500,
    padding: Spacing.lg,
    borderRadius: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  formInput: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
});
