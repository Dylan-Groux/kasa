# Kasa - Messagerie (collection Bruno)

Ouvrir ce dossier dans Bruno ("Open Collection"), sélectionner l'environnement
**Local**, puis exécuter les requêtes dans l'ordre (dossier `01 - Auth` puis
`02 - Conversations`) — chaque requête capture automatiquement les tokens/ids
nécessaires à la suivante via ses scripts post-response.

`baseUrl` pointe le backend réel (`http://localhost:3000` par défaut, à
changer dans l'environnement si besoin). Ces requêtes testent le backend
directement — pour tester la chaîne complète via le proxy Next.js, changer
temporairement `baseUrl` vers l'URL du serveur `next dev`.

## Relancer la collection une seconde fois

`1/2/3 - Register User X` échoueront (email déjà pris) si déjà exécutés une
fois. Utiliser à la place `4 - Login User A` / `5 - Login User B` pour
récupérer un token sans recréer les comptes (le token C ne se régénère pas
automatiquement, relancer `3 - Register User C` en changeant l'email si
nécessaire, ou ajouter une requête Login C sur le même modèle).

## Ce que couvre `02 - Conversations`

- 1-5 : flux nominal (create-or-find, envoi, lecture, liste)
- 6-9 : sécurité — non authentifié (401), non-membre (404, jamais 403),
  conversation inexistante (404 identique au cas non-membre — pas
  d'énumération d'ID)
- 10-14 : validations (contenu vide/espaces/trop long, self-conversation,
  participant inexistant)

Chaque requête porte ses assertions dans son onglet "Tests" (bouton "Run" ou
"Run Folder" dans Bruno pour tout exécuter et voir le résumé pass/fail).
