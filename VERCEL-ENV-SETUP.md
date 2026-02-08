# ⚙️ Configuration des variables d'environnement Vercel

## 🔑 Variables nécessaires

Pour que la synchronisation depuis Storage fonctionne, tu dois configurer ces variables sur Vercel :

### 1. Variables publiques (déjà configurées normalement)

```
NEXT_PUBLIC_SUPABASE_URL
https://genbzwagezbczhnfcguo.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbmJ6d2FnZXpiY3pobmZjZ3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTc0NzQsImV4cCI6MjA4NTg5MzQ3NH0.b0Ligrar60DpYlHQibNXdNWgUpgJbE-EL837NTyYR_A
```

### 2. Variable serveur (optionnelle mais recommandée)

```
SUPABASE_SERVICE_ROLE_KEY
[Ta clé service_role depuis Supabase Dashboard]
```

---

## 📋 Où trouver la service_role_key

1. Va sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionne ton projet
3. Va dans **Settings** (icône ⚙️ en bas à gauche)
4. Clique sur **API**
5. Scroll jusqu'à **Project API keys**
6. Copie la clé **`service_role` (secret)**

⚠️ **ATTENTION** : Ne partage JAMAIS cette clé publiquement !

---

## 🔧 Ajouter les variables sur Vercel

### Méthode 1 : Via le Dashboard

1. Va sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionne ton projet `workflows-project`
3. Va dans **Settings** → **Environment Variables**
4. Ajoute chaque variable :
   - Name : `SUPABASE_SERVICE_ROLE_KEY`
   - Value : [Ta clé copiée depuis Supabase]
   - Environment : Sélectionne **Production**, **Preview**, **Development**
5. Clique sur **Save**

### Méthode 2 : Via CLI

```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY
# Colle ta clé quand demandé
# Sélectionne tous les environnements (Production, Preview, Development)
```

---

## 🔄 Redéployer après l'ajout

Les variables d'environnement ne sont appliquées qu'au prochain déploiement.

**Option A : Nouveau déploiement automatique**
- Fait un commit vide : `git commit --allow-empty -m "Redeploy"`
- Push : `git push origin main`

**Option B : Redéploiement manuel**
1. Va sur Vercel Dashboard → Ton projet
2. Va dans **Deployments**
3. Clique sur **...** du dernier déploiement
4. Clique sur **Redeploy**

---

## ✅ Vérifier que ça marche

Après le redéploiement :

1. Va sur ton site : `/workflows?token=ton-token`
2. Ouvre la console (F12)
3. Clique sur "Synchroniser depuis Storage"
4. Regarde les logs dans la console

**Avec la service_role_key :**
```
✅ Utilisation de la service_role_key
📦 4 fichiers JSON trouvés...
```

**Sans la service_role_key (fallback anon key) :**
```
⚠️ SUPABASE_SERVICE_ROLE_KEY manquante, utilisation de l'anon key
📦 4 fichiers JSON trouvés...
```

Si tu vois **0 fichiers trouvés**, c'est un problème de permissions sur les buckets Storage.

---

## 🛠️ Alternative : Rendre les buckets publics

Si même avec la service_role_key ça ne marche pas, assure-toi que tes buckets sont **publics** :

### Sur Supabase Dashboard :

1. Va dans **Storage**
2. Pour chaque bucket (`workflows-json` et `workflows-screenshots`) :
   - Clique sur **...** (3 points)
   - Clique sur **Edit bucket**
   - **Coche** "Public bucket"
   - Clique sur **Save**

---

## 📊 Résumé

| Variable | Type | Obligatoire | Où trouver |
|----------|------|-------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Publique | ✅ Oui | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publique | ✅ Oui | Supabase → Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur | ⚠️ Recommandée | Supabase → Settings → API → service_role key |

---

🎯 **Si les buckets sont publics, l'anon key suffit. Sinon, tu as besoin de la service_role_key.**
