import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { exerciseRepository } from '@/services/repositories/ExerciseRepository';
import { useRouter } from 'expo-router';
import type { ExerciseCategory } from '@/types/exercise.type';

export default function CreateExercise() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [category, setCategory] = useState<ExerciseCategory | ''>('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Erreur', 'Le nom est obligatoire');
            return;
        }

        setLoading(true);
        try {
            await exerciseRepository.create({
                name: name.trim(),
                category: category || null,
                description: description.trim() || null,
                isCustom: true
            });

            Alert.alert('Succès', 'Exercice créé avec succès', [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ]);

            setName('');
            setCategory('');
            setDescription('');
        } catch (err) {
            Alert.alert('Erreur', err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Créer un exercice</Text>

            <Text style={{ marginBottom: 5 }}>Nom *</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nom de l'exercice"
                style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
            />

            <Text style={{ marginBottom: 5 }}>Catégorie</Text>
            <View style={{ borderWidth: 1, marginBottom: 15 }}>
                <Picker
                    selectedValue={category}
                    onValueChange={(itemValue) => setCategory(itemValue as ExerciseCategory | '')}
                >
                    <Picker.Item label="Sélectionner une catégorie" value="" />
                    <Picker.Item label="Cardio" value="cardio" />
                    <Picker.Item label="Force" value="force" />
                    <Picker.Item label="Mobilité" value="mobilité" />
                    <Picker.Item label="Autre" value="autre" />
                </Picker>
            </View>

            <Text style={{ marginBottom: 5 }}>Description</Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Description de l'exercice"
                multiline
                numberOfLines={4}
                style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            />

            <Button
                title={loading ? 'Création...' : 'Créer'}
                onPress={handleCreate}
                disabled={loading}
            />
        </View>
    );
}
