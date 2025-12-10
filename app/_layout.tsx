import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initDatabase, getDatabase } from '@/database';

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [dbInitialized, setDbInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                await initDatabase();

                // Test : vérifier les tables créées
                const db = getDatabase();
                const tables = await db.getAllAsync<{ name: string }>(
                    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
                );
                console.log('✅ Tables créées:', tables.map(t => t.name));

                // Test : vérifier les migrations appliquées
                const migrations = await db.getAllAsync(
                    'SELECT * FROM schema_migrations ORDER BY id'
                );
                console.log('✅ Migrations appliquées:', migrations);

                setDbInitialized(true);
            } catch (err) {
                console.error('❌ Erreur initialisation DB:', err);
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            }
        };

        init();
    }, []);

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'red', padding: 20 }}>
                    Erreur DB : {error}
                </Text>
            </View>
        );
    }

    if (!dbInitialized) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>
                    Initialisation de la base de données...
                </Text>
            </View>
        );
    }

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="modal"
                    options={{ presentation: "modal", title: "Modal" }}
                />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
