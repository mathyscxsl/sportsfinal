/**
 * ExerciseCard
 * Exemple de composant métier utilisant le design system
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, CardContent, Badge } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';
import { ExerciseCategoryColors } from '@/constants/Colors';
import { Exercise } from '@/types/exercise.type';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
}

export function ExerciseCard({ exercise, onPress }: ExerciseCardProps) {
  const colors = useThemeColors();

  // Mapping des anciennes valeurs françaises vers les nouvelles clés anglaises
  const getCategoryKey = (category: string | null): keyof typeof ExerciseCategoryColors => {
    switch (category) {
      case 'cardio':
        return 'cardio';
      case 'strength':
      case 'force': // Support ancienne valeur
        return 'strength';
      case 'mobility':
      case 'mobilité': // Support ancienne valeur
        return 'mobility';
      default:
        return 'other';
    }
  };

  const categoryKey = getCategoryKey(exercise.category);
  const categoryColor = ExerciseCategoryColors[categoryKey];

  const getCategoryLabel = (category: string | null) => {
    switch (category) {
      case 'cardio':
        return 'Cardio';
      case 'strength':
      case 'force': // Support ancienne valeur
        return 'Force';
      case 'mobility':
      case 'mobilité': // Support ancienne valeur
        return 'Mobilité';
      default:
        return 'Autre';
    }
  };

  const content = (
    <Card variant="elevated">
      <CardContent>
        <View style={styles.header}>
          <Text style={[TextStyles.h4, { color: colors.text }]} numberOfLines={1}>
            {exercise.name}
          </Text>
          {exercise.category && (
            <Badge
              variant="neutral"
              size="sm"
              style={{ backgroundColor: categoryColor.background }}
            >
              {getCategoryLabel(exercise.category)}
            </Badge>
          )}
        </View>

        {exercise.description && (
          <Text
            style={[TextStyles.bodySmall, { color: colors.textSecondary, marginTop: Spacing.xs }]}
            numberOfLines={2}
          >
            {exercise.description}
          </Text>
        )}

        <View style={styles.footer}>
          {exercise.isCustom ? (
            <Badge variant="info" size="sm">
              Personnalisé
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              Prédéfini
            </Badge>
          )}
        </View>
      </CardContent>
    </Card>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.md,
  },
});
