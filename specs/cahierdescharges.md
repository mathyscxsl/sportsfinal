# Projet final — Application de gestion d’entraînement sportif

## 🎯 Objectif

Développer en **équipe de deux** une **application mobile complète** de gestion d’entraînement sportif.

Ce projet valide **l’ensemble des compétences** vues pendant le cours (React Native + Expo, navigation, formulaires, back-end local, capteurs, tests…).

---

## 1️⃣ Règles du jeu

- **Équipe** : 2 étudiants.
- **Évaluation individuelle** : la grille prendra en compte votre investissement (commits GitHub, tâches réalisées).
- **Code source** :
    - Hébergé sur **GitHub** (1 repo par équipe).
    - Commits **fréquents et explicites**.
    - Branches / PR conseillés.
- **Architecture** :
    - Code **clair et maintenable** (structure modulaire, dossiers par domaine).
    - Respect des **bonnes pratiques** vues en cours.
- Utiliser **un maximum de concepts** étudiés dans les modules (TP1 → TP9).

---

## 2️⃣ Fonctionnalités attendues

### A. Planification de séances

- Créer un **programme sportif** composé de plusieurs séances.
- Planifier chaque séance : nom, date, heure, répétition (ex. tous les lundis 18 h).

### B. Pendant la séance

- **Chronométrage** : compte à rebours ou temps écoulé selon le type de séance.
- **Suivi des répétitions** pour chaque exercice (saisie en direct).
- **Gestion des pauses** avec alertes visuelles/sonores.
- **Sons d’encouragement** (ex. via `expo-av`).

### C. Commentaires & feedback

- **Commentaires globaux** sur la séance.
- **Commentaires spécifiques** sur chaque exercice.
- Possibilité de **dictée vocale** (audio stocké en local).

### D. Stockage et consultation

- Base locale **SQLite** pour toutes les données :
    - Programmes, séances, exercices, répétitions, commentaires.
- Historique et suivi de progression.

### E. Tableau de bord

- En fin de séance, afficher :
    - Temps total passé.
    - Nombre total de répétitions (par exercice et global).
    - Statistiques agrégées par programme.

### F. Thème graphique

- Proposer un **style visuel personnalisé** (couleurs, polices, boutons).

---

## 3️⃣ Fonctionnalités optionnelles « ++ » (fortement valorisées)

- **Notifications push** : rappel avant une séance planifiée.
- **Authentification Google** : connexion sécurisée pour l’utilisateur.

---

## 4️⃣ Définition d’une séance de sport

Une séance est une **unité d’entraînement** composée d’exercices paramétrés :

- **Paramétrage** :
    - Choix des exercices (liste prédéfinie + possibilité d’ajouter les siens).
    - Type de séance :
        - **AMRAP** : autant de tours que possible dans un temps donné.
        - **HIIT** : alternance effort/repos.
        - **EMOM** : répétitions au début de chaque minute.
    - Durée ou nombre de répétitions.
    - Nombre de séries.
    - Temps de pause.
- **Planification** :
    - Nom personnalisé.
    - Date et heure.
    - Répétition de la séance.
    - (Optionnel) Notification push avant la séance.
- **Pendant la séance** :
    - Chronomètre ou minuteur.
    - Suivi des répétitions et gestion automatique des pauses.
    - Sons d’encouragement.
- **Fin de séance** :
    - Ajout de commentaires globaux ou par exercice.
    - Dashboard récapitulatif complet.

---

## 5️⃣ Exigences techniques

Votre application **doit** démontrer la maîtrise des points suivants :

| Thème | Exemples |
| --- | --- |
| **Navigation** | Expo Router avec une structure claire (auth, séances, historique…) |
| **Formulaires** | Formik+Yup ou RHF+Zod pour créer/éditer programmes et exercices |
| **Communication locale** | SQLite pour toutes les données, transactions, requêtes filtrées |
| **Gestion d’état** | Zustand ou Redux Toolkit pour les stores globaux |
| **Capteurs** | a vous de choisir le cas d’usage le plus adapté |
| **Médias** | expo-av pour les sons d’encouragement, expo-camera pour les commentaires vocaux |
| **Tests** | Tests unitaires obligatoires sur la logique métier critique (reducers, calculs, etc.) |
| **Thème graphique** | Styles personnalisés cohérents (dark/light mode recommandé) |
| **Donnée en local** | Les données doivent être stockées dans une base SQL Lite |

> Les fonctionnalités push et authentification Google sont en bonus (mais fortement valorisées).
>

---

## 6️⃣ Bonnes pratiques attendues

- Découpage clair en **services**, **composants**, **hooks**.
- Pas de logique métier dans les écrans : passer par des **repositories** ou **stores**.
- Respect des principes de **testabilité** (mocks, injections simples).
- **Commits réguliers et explicites** : un commit = une fonctionnalité claire.

---

## 7️⃣ Livrables

- Lien **GitHub** du projet (repo public ou accès donné).
- Fichier `README.md` comprenant :
    - Contexte et but de l’app.
    - Architecture du projet (schéma des dossiers, modules).
    - Liste des fonctionnalités implémentées (+ mention de celles en bonus).
    - Instructions pour lancer l’app (`npm install`, `npx expo start`).
    - Mode d’emploi des tests (`npm test`).
    - Captures d’écran principales (home, création de séance, dashboard).