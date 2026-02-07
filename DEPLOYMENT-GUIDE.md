# 🚀 Guide de déploiement Vercel

## ✅ Ce qui a été fait

- ✅ Code poussé sur GitHub (commit `da92117`)
- ✅ Système de métadonnées des workflows implémenté
- ✅ Landing page refonte en SaaS waitlist
- ✅ Gestion améliorée des tokens

---

## 📋 Étapes de déploiement

### ÉTAPE 1 : Configuration de la base de données Supabase

**IMPORTANT : Exécute d'abord le SQL avant de tester le site !**

1. Va sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionne ton projet
3. Va dans l'onglet **SQL Editor**
4. Copie **tout le contenu** de `sql-final.sql`
5. Colle dans l'éditeur SQL
6. Clique sur **"Run"**

**Ce script va :**
- ✅ Nettoyer les leads sans token
- ✅ Ajouter les contraintes UNIQUE nécessaires
- ✅ Créer les index pour optimiser les requêtes
- ✅ Désactiver RLS sur toutes les tables
- ✅ Ajouter les colonnes `name` et `description` dans `workflows`
- ✅ Créer un lead de test avec un token

**Résultat attendu :**
Tu devrais voir dans les résultats :
- Un lead de test avec email `test-final@example.com`
- Un token UUID généré (copie-le !)
- La liste de tous tes workflows

---

### ÉTAPE 2 : Déploiement sur Vercel

#### Option A : Le projet existe déjà sur Vercel

1. Va sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Trouve ton projet `workflows-project`
3. Un nouveau déploiement devrait être en cours ("Building..." ou "Ready")
4. Attends que le statut soit **"Ready"** (environ 1-2 minutes)

#### Option B : Le projet n'existe plus (erreur 404)

1. Va sur [vercel.com/new](https://vercel.com/new)
2. Clique sur **"Import Git Repository"**
3. Sélectionne `Agency-Synapse/workflows-project`
4. Configure le projet :
   - **Framework Preset** : Next.js
   - **Root Directory** : `./` (par défaut)
   - **Build Command** : `npm run build` (par défaut)
   - **Output Directory** : `.next` (par défaut)

5. **IMPORTANT : Variables d'environnement**

   Clique sur **"Environment Variables"** et ajoute :

   ```
   Nom : NEXT_PUBLIC_SUPABASE_URL
   Valeur : https://genbzwagezbczhnfcguo.supabase.co
   ```

   ```
   Nom : NEXT_PUBLIC_SUPABASE_ANON_KEY
   Valeur : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbmJ6d2FnZXpiY3pobmZjZ3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTc0NzQsImV4cCI6MjA4NTg5MzQ3NH0.b0Ligrar60DpYlHQibNXdNWgUpgJbE-EL837NTyYR_A
   ```

6. Clique sur **"Deploy"**
7. Attends 1-2 minutes que le build se termine

---

### ÉTAPE 3 : Tester le déploiement

#### Test 1 : Accès direct avec le token de test

1. Récupère le token du lead de test (depuis les résultats du SQL)
2. Va sur : `https://ton-site.vercel.app/workflows?token=LE-TOKEN-ICI`
3. **Résultat attendu :**
   - La page `/workflows` s'affiche
   - Tu vois les 3-4 workflows avec leurs titres et descriptions générés automatiquement
   - Les screenshots s'affichent correctement

#### Test 2 : Inscription depuis la landing page

1. Va sur `https://ton-site.vercel.app`
2. Entre ton email dans le formulaire
3. Clique sur **"Réserver ma place en early access"**
4. **Résultat attendu :**
   - Message de succès : "C'est bon, tu es sur la liste ! 🎉"
   - Redirection automatique vers `/workflows` après 2 secondes
   - Les workflows s'affichent avec leurs métadonnées

#### Test 3 : Téléchargement d'un workflow

1. Sur la page `/workflows`
2. Clique sur le bouton **"Download"** d'un workflow
3. **Résultat attendu :**
   - Le fichier JSON se télécharge automatiquement
   - Pas d'ouverture dans le navigateur

#### Test 4 : Synchronisation des métadonnées

1. Sur la page `/workflows`
2. Scroll en bas de la page
3. Clique sur **"Mettre à jour les métadonnées"**
4. **Résultat attendu :**
   - Alert : "✅ X workflows mis à jour dans la base !"
   - Les métadonnées sont maintenant sauvegardées dans Supabase

---

## 🔍 Diagnostic en cas de problème

### Problème 1 : "Token invalide ou expiré"

**Cause :** Le SQL n'a pas été exécuté ou la table `leads` est vide.

**Solution :**
1. Exécute `sql-final.sql` sur Supabase
2. Vérifie que la table `leads` contient au moins 1 ligne avec un `access_token`

### Problème 2 : "Aucun workflow disponible"

**Cause :** La table `workflows` est vide ou les colonnes `json_filename` ne sont pas remplies.

**Solution :**
1. Va sur Supabase → Table Editor → `workflows`
2. Vérifie que tu as au moins 3-4 workflows avec :
   - `json_filename` rempli (ex: `search-console-reports.json`)
   - `screenshot_filename` rempli (ex: `search-console-reports.png`)
3. Les colonnes `name` et `description` peuvent être vides (générées automatiquement)

### Problème 3 : Variables d'environnement manquantes

**Cause :** Les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` ne sont pas configurées sur Vercel.

**Solution :**
1. Va sur Vercel Dashboard → Ton projet → Settings → Environment Variables
2. Ajoute les 2 variables (voir ÉTAPE 2, Option B, point 5)
3. Redéploie le projet (Settings → Deployments → ... → Redeploy)

### Problème 4 : Build failed sur Vercel

**Cause :** Erreur de compilation TypeScript ou dépendance manquante.

**Solution :**
1. Va sur Vercel Dashboard → Deployments
2. Clique sur le déploiement qui a échoué
3. Lis les logs pour voir l'erreur exacte
4. Si tu me partages l'erreur, je peux t'aider à la corriger

---

## 📝 Checklist finale

- [ ] SQL exécuté sur Supabase
- [ ] Contrainte UNIQUE sur `leads.email` ajoutée
- [ ] Index sur `leads.access_token` créé
- [ ] RLS désactivée sur toutes les tables
- [ ] Colonnes `name` et `description` ajoutées dans `workflows`
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Déploiement terminé avec succès sur Vercel
- [ ] Test avec le token de test réussi
- [ ] Inscription depuis la landing réussie
- [ ] Téléchargement d'un workflow réussi
- [ ] Synchronisation des métadonnées réussie

---

## 🎉 Une fois tout configuré

Tu pourras :

1. **Ajouter de nouveaux workflows facilement :**
   - Upload le JSON + screenshot dans Supabase Storage
   - Insert dans la table `workflows` (juste `json_filename` et `screenshot_filename`)
   - Le titre/description se génèrent automatiquement

2. **Personnaliser les métadonnées :**
   - Édite `lib/workflowsMeta.ts`
   - Ajoute un preset pour ton workflow
   - Commit + push → Vercel redéploie automatiquement

3. **Collecter des emails :**
   - Les inscriptions vont dans `saas_waitlist`
   - Un lead avec token est créé automatiquement dans `leads`
   - Tu peux exporter la liste depuis Supabase

4. **Gérer les workflows :**
   - Modifier les métadonnées directement dans Supabase Table Editor
   - Ou utiliser le bouton "Sync" sur le site pour regénérer automatiquement

---

## 🆘 Besoin d'aide ?

Si tu rencontres un problème :

1. Vérifie les logs de la console (F12) dans le navigateur
2. Vérifie les logs de déploiement sur Vercel
3. Partage-moi les erreurs que tu vois

Bon déploiement ! 🚀
