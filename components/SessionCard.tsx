/**
 * SessionCard Component
 * Carte pour afficher les informations d'une séance
 */

import { Spacing } from "@/constants/Spacing";
import { TextStyles } from "@/constants/Typography";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { Session } from "@/types/session.type";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card, CardContent } from "./ui";

interface SessionCardProps {
  session: Session & { exerciseCount?: number };
  onPress?: () => void;
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const colors = useThemeColors();

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

  const getSessionTypeColor = (type: Session["type"]): string => {
    switch (type) {
      case "AMRAP":
        return "#FF6B6B";
      case "HIIT":
        return "#4ECDC4";
      case "EMOM":
        return "#FFE66D";
      case "CUSTOM":
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (timestamp: number | undefined): string => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const Content = (
    <Card variant="elevated">
      <CardContent>
        <View style={styles.header}>
          <View style={styles.title}>
            <Text style={[TextStyles.h4, { color: colors.text }]}>
              {session.name}
            </Text>
            {session.plannedAt && (
              <Text
                style={[
                  TextStyles.caption,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                📅 {formatDate(session.plannedAt)}
              </Text>
            )}
          </View>
          <View
            style={{
              backgroundColor: getSessionTypeColor(session.type) + "20",
              paddingHorizontal: Spacing.sm,
              paddingVertical: Spacing.xs,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: getSessionTypeColor(session.type),
                fontWeight: "600",
                fontSize: 12,
              }}
            >
              {getSessionTypeLabel(session.type)}
            </Text>
          </View>
        </View>

        <View style={styles.info}>
          {session.exerciseCount !== undefined && (
            <View style={styles.infoItem}>
              <Text
                style={[TextStyles.caption, { color: colors.textSecondary }]}
              >
                💪 {session.exerciseCount} exercice
                {session.exerciseCount > 1 ? "s" : ""}
              </Text>
            </View>
          )}
          {session.notificationEnabled === 1 && (
            <View style={styles.infoItem}>
              <Text
                style={[TextStyles.caption, { color: colors.textSecondary }]}
              >
                🔔 Notifications activées
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[
            TextStyles.caption,
            { color: colors.textSecondary, marginTop: Spacing.xs },
          ]}
        >
          Créée le {formatDate(session.createdAt)}
        </Text>
      </CardContent>
    </Card>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{Content}</TouchableOpacity>;
  }

  return Content;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  title: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  info: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  infoItem: {
    // Info items wrapper
  },
});
