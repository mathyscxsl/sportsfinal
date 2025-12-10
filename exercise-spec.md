D'après l'arborescence fournie, voici comment implémenter la ressource "exercice" de manière structurée :

1. **Types et Interfaces**
- Définir les types d'exercice dans `/types/database.types.ts` OK
- Inclure les propriétés essentielles : nom, description, catégorie, muscles ciblés, etc. OK

2. **Base de données**
- Ajouter la table exercices dans `migrations.ts` OK
- Créer les requêtes SQLite nécessaires dans `initDatabase.ts` OK

3. **Couche Repository (DAO) : isolation du SQL**
- Dans `ExerciseRepository.ts`, implémenter les méthodes CRUD :
   - Création d'exercice
   - Lecture (liste et détail)
   - Mise à jour
   - Suppression

4. **Store Zustand**
- Dans `exerciseStore.ts`, gérer :
   - L'état des exercices
   - Les actions de modification
   - Le cache et la synchronisation

5. **Composants UI**
- Développer dans `/components/exercise` :
   - `ExerciseItem` pour l'affichage unitaire
   - `ExerciseForm` pour création/édition

6. **Écrans**
- Implémenter dans `/app/exercise` :
   - `list.tsx` : liste paginée et filtrée
   - `create.tsx` : formulaire de création
   - `[id].tsx` : vue détaillée

7. **Validation**
- Ajouter dans `validators.ts` les schémas Zod pour :
   - Validation des formulaires
   - Vérification des données

Cette structure suit une architecture en couches avec séparation claire des responsabilités.