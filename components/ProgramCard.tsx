import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, CardContent } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TextStyles } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import type { Program } from '@/types/program.type';

interface ProgramCardProps {
  program: Program & { sessionCount?: number };
  onPress: () => void;
}

export function ProgramCard({ program, onPress }: ProgramCardProps) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated">
        <CardContent>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[TextStyles.h4, { color: colors.text, flex: 1 }]}>
                {program.name}
              </Text>
              {program.sessionCount !== undefined && (
                <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[TextStyles.caption, { color: colors.primary, fontWeight: '600' }]}>
                    {program.sessionCount} séance{program.sessionCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>

            {program.description && (
              <Text
                style={[TextStyles.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}
                numberOfLines={2}
              >
                {program.description}
              </Text>
            )}

            <Text style={[TextStyles.caption, { color: colors.textTertiary, marginTop: Spacing.sm }]}>
              Créé le {new Date(program.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
});
