/**
 * Design System Demo
 * Écran de démonstration de tous les composants UI
 * Accessible via /design-system-demo
 */

import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { Button, Input, Card, CardHeader, CardContent, CardFooter, Badge, LoadingSpinner } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';

export default function DesignSystemDemo() {
  const colors = useThemeColors();
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleButtonPress = (message: string) => {
    Alert.alert('Bouton cliqué', message);
  };

  const handleValidation = () => {
    if (inputValue.length < 3) {
      setInputError('Minimum 3 caractères requis');
    } else {
      setInputError('');
      Alert.alert('Succès', `Valeur validée : ${inputValue}`);
    }
  };

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Design System</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tous les composants UI disponibles
        </Text>
      </View>

      {/* Section Buttons */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Buttons</Text>

        <Card variant="elevated">
          <CardContent>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Variants</Text>
            <View style={styles.buttonGroup}>
              <Button variant="primary" onPress={() => handleButtonPress('Primary')}>
                Primary
              </Button>
              <Button variant="secondary" onPress={() => handleButtonPress('Secondary')}>
                Secondary
              </Button>
              <Button variant="outline" onPress={() => handleButtonPress('Outline')}>
                Outline
              </Button>
              <Button variant="danger" onPress={() => handleButtonPress('Danger')}>
                Danger
              </Button>
              <Button variant="ghost" onPress={() => handleButtonPress('Ghost')}>
                Ghost
              </Button>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
              Sizes
            </Text>
            <View style={styles.buttonGroup}>
              <Button size="sm" onPress={() => handleButtonPress('Small')}>
                Small
              </Button>
              <Button size="md" onPress={() => handleButtonPress('Medium')}>
                Medium
              </Button>
              <Button size="lg" onPress={() => handleButtonPress('Large')}>
                Large
              </Button>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
              States
            </Text>
            <View style={styles.buttonGroup}>
              <Button disabled onPress={() => {}}>
                Disabled
              </Button>
              <Button loading={loading} onPress={simulateLoading}>
                {loading ? 'Loading...' : 'Click to Load'}
              </Button>
            </View>

            <Button
              variant="primary"
              fullWidth
              onPress={() => handleButtonPress('Full Width')}
              style={{ marginTop: Spacing.md }}
            >
              Full Width Button
            </Button>
          </CardContent>
        </Card>
      </View>

      {/* Section Inputs */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Inputs</Text>

        <Card variant="elevated">
          <CardContent>
            <Input
              label="Nom"
              placeholder="Entrez votre nom"
              value={inputValue}
              onChangeText={setInputValue}
              error={inputError}
            />

            <Input
              label="Email"
              placeholder="exemple@email.com"
              keyboardType="email-address"
              helperText="Nous ne partagerons jamais votre email"
              style={{ marginTop: Spacing.md }}
            />

            <Input
              label="Mot de passe"
              placeholder="••••••••"
              secureTextEntry
              style={{ marginTop: Spacing.md }}
            />

            <Input
              label="Description"
              placeholder="Décrivez votre exercice..."
              multiline
              numberOfLines={4}
              style={{ marginTop: Spacing.md, height: 100 }}
            />

            <Button variant="primary" onPress={handleValidation} style={{ marginTop: Spacing.md }}>
              Valider
            </Button>
          </CardContent>
        </Card>
      </View>

      {/* Section Cards */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Cards</Text>

        <Card variant="elevated" style={{ marginBottom: Spacing.md }}>
          <CardHeader>
            <Text style={[TextStyles.h4, { color: colors.text }]}>Elevated Card</Text>
          </CardHeader>
          <CardContent>
            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
              Cette carte a une ombre pour créer un effet d&#39;élévation.
            </Text>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onPress={() => {}}>
              Action
            </Button>
          </CardFooter>
        </Card>

        <Card variant="outlined" style={{ marginBottom: Spacing.md }}>
          <CardHeader>
            <Text style={[TextStyles.h4, { color: colors.text }]}>Outlined Card</Text>
          </CardHeader>
          <CardContent>
            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
              Cette carte a une bordure sans ombre.
            </Text>
          </CardContent>
        </Card>

        <Card variant="filled">
          <CardContent>
            <Text style={[TextStyles.h4, { color: colors.text }]}>Filled Card</Text>
            <Text style={[TextStyles.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
              Cette carte a un fond coloré.
            </Text>
          </CardContent>
        </Card>
      </View>

      {/* Section Badges */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Badges</Text>

        <Card variant="elevated">
          <CardContent>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Variants</Text>
            <View style={styles.badgeRow}>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="error">Error</Badge>
            </View>
            <View style={[styles.badgeRow, { marginTop: Spacing.sm }]}>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="neutral">Neutral</Badge>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
              Sizes
            </Text>
            <View style={styles.badgeRow}>
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
              Exemples d&#39;utilisation
            </Text>
            <View style={styles.badgeRow}>
              <Badge variant="success">AMRAP</Badge>
              <Badge variant="error">HIIT</Badge>
              <Badge variant="warning">EMOM</Badge>
              <Badge variant="info">CUSTOM</Badge>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Section Loading */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Loading Spinner</Text>

        <Card variant="elevated">
          <CardContent>
            <LoadingSpinner message="Chargement..." />
            <LoadingSpinner size="small" style={{ marginTop: Spacing.lg }} />
          </CardContent>
        </Card>
      </View>

      {/* Exemple Complet */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Exemple Complet</Text>

        <Card variant="elevated">
          <CardHeader>
            <View style={styles.cardHeaderRow}>
              <Text style={[TextStyles.h4, { color: colors.text }]}>Programme Force</Text>
              <Badge variant="success">Actif</Badge>
            </View>
          </CardHeader>
          <CardContent>
            <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
              Programme de 8 semaines pour développer la force maximale.
            </Text>
            <View style={[styles.badgeRow, { marginTop: Spacing.md }]}>
              <Badge variant="info" size="sm">
                3 séances/semaine
              </Badge>
              <Badge variant="neutral" size="sm">
                12 exercices
              </Badge>
            </View>
          </CardContent>
          <CardFooter>
            <View style={styles.cardActions}>
              <Button variant="outline" size="sm" onPress={() => {}}>
                Modifier
              </Button>
              <Button variant="primary" size="sm" onPress={() => {}}>
                Commencer
              </Button>
            </View>
          </CardFooter>
        </Card>
      </View>

      {/* Spacer */}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
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
    marginBottom: Spacing.xl,
  },
  title: {
    ...TextStyles.h1,
  },
  subtitle: {
    ...TextStyles.body,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...TextStyles.h3,
    marginBottom: Spacing.md,
  },
  label: {
    ...TextStyles.label,
    marginBottom: Spacing.sm,
  },
  buttonGroup: {
    gap: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
});
