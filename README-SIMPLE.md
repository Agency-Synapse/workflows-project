# 🚀 Guide Ultra-Simple : 3 étapes pour tout faire marcher

## ⚡ ÉTAPE 1 : Nettoyer la base Supabase (2 minutes)

1. Va sur [Supabase Dashboard](https://supabase.com/dashboard) → Ton projet → **SQL Editor**
2. Copie **TOUT** le fichier `sql-clean-restart.sql`
3. Colle dans l'éditeur SQL et clique sur **"Run"**
4. ✅ Tu devrais voir :
   - Un lead de test avec token `test-token-123456`
   - Tes 3-4 workflows

---

## ⚡ ÉTAPE 2 : Redéployer sur Vercel (3 minutes)

### Option A : Le projet existe déjà

1. Va sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Trouve `workflows-project`
3. Un nouveau build devrait être en cours
4. Attends qu'il soit **"Ready"** (1-2 min)

### Option B : Le projet n'existe plus (404)

1. Va sur [vercel.com/new](https://vercel.com/new)
2. Importe `Agency-Synapse/workflows-project`
3. **Variables d'environnement** (IMPORTANT) :
   ```
   NEXT_PUBLIC_SUPABASE_URL
   https://genbzwagezbczhnfcguo.supabase.co
   
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbmJ6d2FnZXpiY3pobmZjZ3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTc0NzQsImV4cCI6MjA4NTg5MzQ3NH0.b0Ligrar60DpYlHQibNXdNWgUpgJbE-EL837NTyYR_A
   ```
4. Clique sur **"Deploy"**

---

## ⚡ ÉTAPE 3 : Tester (1 minute)

### Test 1 : Avec le token de test

Va sur : `https://ton-site.vercel.app/workflows?token=test-token-123456`

✅ **Résultat attendu** : Tu vois la page avec les 3-4 workflows

### Test 2 : Inscription complète

1. Va sur `https://ton-site.vercel.app`
2. Entre ton email
3. Clique sur "Réserver ma place"
4. Tu es redirigé vers `/workflows` automatiquement
5. ✅ **Résultat** : Tu vois les workflows

---

## 🎯 C'est tout !

Maintenant le flux fonctionne simplement :

1. **Utilisateur entre son email** → Formulaire sur la landing
2. **Token créé/récupéré automatiquement** → Même si l'email existe déjà
3. **Redirection vers /workflows** → Avec le token dans l'URL
4. **Workflows affichés** → Depuis Supabase avec métadonnées auto-générées

---

## 🔥 Fonctionnalités

- ✅ Email déjà inscrit ? → Réutilise le token existant
- ✅ Pas de workflows ? → Message clair affiché
- ✅ Métadonnées manquantes ? → Générées automatiquement depuis les noms de fichiers
- ✅ Bouton "Sync" → Sauvegarde les métadonnées dans la base
- ✅ Download → Télécharge directement le fichier JSON

---

## ❓ Problèmes courants

### "Aucun workflow disponible"

→ La table `workflows` est vide. Ajoute des workflows :

```sql
INSERT INTO workflows (json_filename, screenshot_filename)
VALUES 
  ('search-console-reports.json', 'search-console-reports.png'),
  ('landing-page-cro-audit.json', 'landing-page-cro-audit.png'),
  ('CLAUDE.md', 'claude-context.png');
```

### "Token invalide"

→ Recommence l'inscription depuis la landing page. Le système créera automatiquement un nouveau token.

### Page blanche sur Vercel

→ Vérifie que les variables d'environnement sont bien configurées :
- Settings → Environment Variables
- Doit contenir `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Si manquantes, ajoute-les et redéploie

---

## 🆘 Besoin d'aide ?

1. Ouvre la console (F12) dans ton navigateur
2. Regarde les logs (ils sont très détaillés maintenant)
3. Partage-moi ce que tu vois dans les logs

C'est fait pour être **simple et robuste**. Même si un email existe déjà, même si un token n'est pas trouvé, le système continue de fonctionner et affiche ce qu'il peut.
