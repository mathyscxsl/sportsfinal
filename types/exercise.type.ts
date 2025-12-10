/**
 * Types et interfaces pour la gestion des exercices dans l'application
 *
 * Ce fichier contient
 * - Les catégories possibles d'exercices (ExerciseCategory).
 * - La structure complète d'un exercice (Exercise).
 * - Les types pour la création (CreateExerciseInput).
 * - Les types pour la mise à jour (UpdateExerciseInput).
 *
 * @example
 * const exercise : Exercise = {
 *   id : 1,
 *   name : "Pompes",
 *   category : "force",
 *   description : "Exercice de force pour le haut du corps",
 *   isCustom : true,
 *   createdAt : 05/03/2024 15:34:07,
 *   updatedAt : 05/03/2024 15:34:07
 * };
 */

export type ExerciseCategory = 'cardio' | 'force' | 'mobilité' | 'autre';

export interface Exercise {
    id: number;
    name: string;
    category: ExerciseCategory | null;
    description: string | null;
    isCustom: boolean;
    createdAt: number;
    updatedAt: number;
}

export type CreateExerciseInput = Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateExerciseInput = Partial<CreateExerciseInput> & { id: number };
