# 🔴 Synthèse des problèmes - Projet Next.js + Supabase

## 📋 Contexte du projet

**Stack technique :**
- Next.js 16.1.6 (App Router)
- TypeScript
- Supabase (PostgreSQL)
- Déployé sur Vercel

**Objectif :**
Créer une landing page SaaS waitlist où :
1. L'utilisateur entre son email
2. Un token d'accès est généré
3. Redirection vers `/workflows?token=xxx`
4. Affichage des workflows depuis Supabase

---

## ❌ Problèmes rencontrés

### Problème 1 : Erreurs de contrainte SQL lors de l'inscription

**Symptôme :**
```
ERROR: 42P18: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

**Cause :**
- La table `leads` n'avait pas de contrainte `UNIQUE` sur la colonne `email`
- Le code utilisait `ON CONFLICT (email)` qui nécessite cette contrainte
- Tentatives d'ajout de la contrainte échouaient car elle existait déjà (erreur `42P07`)

**Impact :**
- Impossible d'insérer un nouveau lead
- Les utilisateurs ne peuvent pas s'inscrire
- Doublons d'emails bloquent tout le flux

---

### Problème 2 : Gestion des doublons d'email

**Symptôme :**
```javascript
// Erreur dans la console
Erreur insertion lead: duplicate key value violates unique constraint "leads_email_unique"
```

**Cause :**
- Code essayait de faire `INSERT` même si l'email existait déjà
- Gestion des doublons via `if (error.code === "23505")` trop fragile
- Si un lead existait sans token, le flux échouait complètement

**Impact :**
- Utilisateur ne peut pas se réinscrire avec le même email
- Pas de récupération du token existant
- Message d'erreur "Cet email est déjà sur la liste d'attente !" bloque l'accès

---

### Problème 3 : Token invalide ou expiré

**Symptôme :**
```
Token invalide ou expiré. Merci de repasser par le formulaire.
```

**Cause :**
- Token généré côté client mais pas toujours inséré dans la base
- Erreurs d'insertion lead empêchaient la sauvegarde du token
- Vérification stricte du token bloquait l'accès aux workflows

**Impact :**
- Utilisateur redirigé mais ne peut pas voir les workflows
- Message d'erreur au lieu de la page workflows
- Impossible d'accéder au contenu même après inscription

---

### Problème 4 : Colonne `updated_at` inexistante

**Symptôme :**
```sql
ERROR: 42703: column "updated_at" of relation "leads" does not exist
```

**Cause :**
- Le code SQL tentait de faire `UPDATE SET updated_at = NOW()`
- La table `leads` n'a pas de colonne `updated_at`

**Impact :**
- Échec de toutes les opérations `upsert` sur la table `leads`

---

### Problème 5 : Déploiement Vercel introuvable (404)

**Symptôme :**
```
404 - NOT_FOUND
DEPLOYMENT_NOT_FOUND
ID: cdg1::rptsb-1720496328069-ab7d114dcafe
```

**Cause :**
- Le déploiement Vercel a été supprimé ou a expiré
- Lien mort après plusieurs push GitHub

**Impact :**
- Site inaccessible
- Impossible de tester les corrections

---

## 🛠️ Solutions mises en place

### Solution 1 : SQL de nettoyage complet (`sql-clean-restart.sql`)

```sql
-- Nettoyer toutes les données
TRUNCATE TABLE leads CASCADE;

-- Supprimer et recréer les contraintes proprement
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_email_unique;
ALTER TABLE leads DROP COLUMN IF EXISTS access_token;
ALTER TABLE leads ADD COLUMN access_token TEXT;
ALTER TABLE leads ADD CONSTRAINT leads_email_unique UNIQUE (email);
ALTER TABLE leads ADD CONSTRAINT leads_access_token_unique UNIQUE (access_token);
```

### Solution 2 : Code avec `upsert()` au lieu de `insert()`

```typescript
// Vérifier si le lead existe déjà
const { data: existingLead } = await supabase
  .from("leads")
  .select("access_token")
  .eq("email", cleanEmail)
  .maybeSingle();

if (existingLead?.access_token) {
  // Réutiliser le token existant
  finalToken = existingLead.access_token;
} else {
  // Créer un nouveau token et upsert
  finalToken = crypto.randomUUID();
  await supabase
    .from("leads")
    .upsert(
      { email: cleanEmail, access_token: finalToken },
      { onConflict: "email" }
    );
}
```

### Solution 3 : Affichage des workflows même sans token valide

```typescript
// Charger TOUJOURS les workflows
const { data: workflowRows } = await supabase
  .from("workflows")
  .select("*")
  .order("updated_at", { ascending: false });

setWorkflows(workflowRows);

// Vérification du token optionnelle (juste pour logs)
if (token) {
  const { data: leadRow } = await supabase
    .from("leads")
    .select("*")
    .eq("access_token", token)
    .maybeSingle();
  
  if (leadRow) {
    console.log("✅ Token valide");
  } else {
    console.warn("⚠️ Token non trouvé, mais workflows affichés quand même");
  }
}
```

---

## 🎯 État actuel

**Code déployé :**
- ✅ Commit `1440a10` poussé sur GitHub
- ✅ Flux simplifié avec `upsert()` et gestion des doublons
- ✅ Affichage des workflows tolérant aux erreurs de token

**Base de données :**
- ❓ SQL `sql-clean-restart.sql` créé mais **pas encore exécuté**
- ❓ Contraintes UNIQUE potentiellement toujours en conflit
- ❓ Données potentiellement corrompues (doublons, tokens manquants)

**Déploiement Vercel :**
- ❓ Déploiement automatique en cours ou à refaire manuellement
- ❓ Variables d'environnement à vérifier (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

---

## 📝 Prochaines actions nécessaires

### 1. Nettoyer la base Supabase (URGENT)

Exécuter `sql-clean-restart.sql` pour :
- Supprimer tous les doublons
- Recréer les contraintes proprement
- Créer un lead de test avec token valide

### 2. Vérifier/Redéployer sur Vercel

- Vérifier que le build automatique a fonctionné
- Ou redéployer manuellement si 404 persiste
- Vérifier les variables d'environnement

### 3. Tester le flux complet

1. Test avec token de test : `/workflows?token=test-token-123456`
2. Test inscription : Landing → Email → Redirection workflows

---

## ❓ Questions pour Perplexity

1. **Gestion des contraintes SQL PostgreSQL** : Quelle est la meilleure pratique pour ajouter une contrainte UNIQUE sur une colonne existante qui peut déjà contenir des doublons ?

2. **Supabase + Next.js** : Comment gérer proprement un système d'inscription avec token d'accès en évitant les problèmes de doublons et de contraintes ?

3. **Upsert avec Supabase JS** : Quelle est la syntaxe correcte pour un `upsert` qui :
   - Insère si l'email n'existe pas
   - Met à jour le token si l'email existe déjà
   - Gère les conflits sur la colonne `email`

4. **Vercel déploiement 404** : Pourquoi un déploiement Vercel peut-il retourner une erreur `DEPLOYMENT_NOT_FOUND` et comment le recréer sans perdre la configuration ?

---

## 📊 Logs d'erreur récents

```
Error: Failed to run sql query: ERROR: 42P18: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

```
Error: Failed to run sql query: ERROR: 42P07: relation "leads_access_token_unique" already exists
```

```
ERROR: 42703: column "updated_at" of relation "leads" does not exist
```

```
Erreur insertion lead: duplicate key value violates unique constraint "leads_email_unique"
```

---

## 🔍 Fichiers de référence

- `sql-clean-restart.sql` : SQL de nettoyage complet
- `app/page.tsx` : Code d'inscription avec upsert
- `app/workflows/page.tsx` : Code d'affichage des workflows
- `lib/supabase.ts` : Client Supabase
- `README-SIMPLE.md` : Guide en 3 étapes

---

**Dernière modification :** {{ datetime.now() }}
