import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, CardContent, CardHeader, Badge, SafeAreaView } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';

export default function Dashboard() {
    const colors = useThemeColors();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[TextStyles.h1, { color: colors.text }]}>Accueil</Text>
                    <Text style={[TextStyles.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                        Bienvenue dans votre app de sport
                    </Text>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    <Card variant="filled" style={styles.statCard}>
                        <CardContent style={styles.statContent}>
                            <Text style={[TextStyles.h2, { color: colors.primary }]}>0</Text>
                            <Text style={[TextStyles.bodySmall, { color: colors.textSecondary }]}>
                                Programmes
                            </Text>
                        </CardContent>
                    </Card>
                    <Card variant="filled" style={styles.statCard}>
                        <CardContent style={styles.statContent}>
                            <Text style={[TextStyles.h2, { color: colors.secondary }]}>0</Text>
                            <Text style={[TextStyles.bodySmall, { color: colors.textSecondary }]}>
                                Séances
                            </Text>
                        </CardContent>
                    </Card>
                </View>

                {/* Design System Demo */}
                <Card variant="elevated" style={{ marginTop: Spacing.md }}>
                    <CardHeader>
                        <View style={styles.cardHeaderRow}>
                            <Text style={[TextStyles.h4, { color: colors.text }]}>
                                🎨 Design System
                            </Text>
                            <Badge variant="info" size="sm">Nouveau</Badge>
                        </View>
                    </CardHeader>
                    <CardContent>
                        <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
                            Découvrez tous les composants UI disponibles pour créer vos écrans
                        </Text>
                        <Button
                            variant="primary"
                            onPress={() => router.push('/design-system-demo')}
                            style={{ marginTop: Spacing.md }}
                            fullWidth
                        >
                            Voir la démo
                        </Button>
                    </CardContent>
                </Card>

                {/* Exercices */}
                <Card variant="elevated" style={{ marginTop: Spacing.md }}>
                    <CardHeader>
                        <Text style={[TextStyles.h4, { color: colors.text }]}>
                            💪 Exercices
                        </Text>
                    </CardHeader>
                    <CardContent>
                        <Text style={[TextStyles.body, { color: colors.textSecondary, marginBottom: Spacing.md }]}>
                            Gérez votre bibliothèque d&#39;exercices personnalisés
                        </Text>
                        <View style={styles.buttonGroup}>
                            <Button
                                variant="outline"
                                onPress={() => router.push('/exercise/list')}
                                fullWidth
                            >
                                📋 Liste des exercices
                            </Button>
                            <Button
                                variant="secondary"
                                onPress={() => router.push('/exercise/create')}
                                style={{ marginTop: Spacing.sm }}
                                fullWidth
                            >
                                ➕ Créer un exercice
                            </Button>
                        </View>
                    </CardContent>
                </Card>

                {/* Spacer bottom */}
                <View style={{ height: Spacing.xl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
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
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    statCard: {
        flex: 1,
    },
    statContent: {
        alignItems: 'center',
        padding: Spacing.sm,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonGroup: {
        width: '100%',
    },
});