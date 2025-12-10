# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

```tree

/app
  /(tabs)           # Navigation principale
    index.tsx       # Dashboard
    programs.tsx    # Liste des programmes
    sessions.tsx    # Historique des séances
    profile.tsx     # Profil utilisateur
  /session
    [id].tsx        # Écran de séance active
    create.tsx      # Création de séance
  /program
    create.tsx      # Création de programme
    [id].tsx        # Détail d'un programme
  /exercise
    list.tsx        # Liste des exercices
    create.tsx      # Création d'exercice
    [id].tsx        # Détail d'un exercice
  _layout.tsx       # Layout root

/src
  /components       # Composants réutilisables
    /ui             # Boutons, inputs, cards
    /session        # Timer, ExerciseTracker, RestTimer
    /program        # ProgramCard, SessionCard
    /exercise       # ExerciseItem, ExerciseForm
  /services
    /database       # Configuration SQLite
      initDatabase.ts
      migrations.ts
    /repositories   # Accès aux données
      ProgramRepository.ts
      SessionRepository.ts
      ExerciseRepository.ts
    /audio          # Gestion des sons
      AudioService.ts
    /notifications  # Push notifications
      NotificationService.ts
  /stores           # Stores Zustand
    sessionStore.ts
    programStore.ts
    exerciseStore.ts
    userStore.ts
  /hooks            # Custom hooks
    useTimer.ts
    useDatabase.ts
    useAudio.ts
    useSession.ts
  /types            # Définitions TypeScript
    database.types.ts
    session.types.ts
    program.types.ts
  /utils            # Fonctions utilitaires
    calculations.ts # Calculs de stats
    validators.ts   # Validateurs Zod
    dateHelpers.ts  # Manipulation de dates
  /constants        # Constantes (couleurs, config)
    theme.ts
    sessionTypes.ts

```

## Données par défaut (Seeder)

La base de données SQLite est initialisée au démarrage de l’app via `initDatabase()`. Après l’application des migrations, un seeder insère une liste d’exercices par défaut si la table `exercises` ne contient pas encore ces entrées. Le seeding est idempotent (contrôle par nom, pas de doublon).

Fichiers clés:

- `database/migrations.ts`: schéma et migrations.
- `database/index.ts`: ouverture de la DB, application des migrations et appel au seeder.
- `database/seeder.ts`: liste des exercices par défaut et insertion.

Pour rejouer le seeding proprement, vous pouvez réinitialiser la base locale:

1. Fermer l’app Expo.
2. Supprimer le fichier SQLite de l’app (dépend de la plateforme/sandbox Expo).
3. Relancer l’app; les migrations et le seeder seront rejoués automatiquement.
