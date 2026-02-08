# 🚀 GUIDE SIMPLE : Ajouter un workflow en 5 minutes

## ✅ PROCÉDURE COMPLÈTE (méthode qui marche à tous les coups)

### ÉTAPE 1 : Préparer tes fichiers (2 min)

**Règles de nommage (IMPORTANT) :**
- ✅ Utilise des **tirets** ou **underscores** (pas d'espaces)
- ✅ Tout en **minuscules**
- ✅ **Même nom de base** pour le JSON et le screenshot

**✅ Exemples corrects :**
```
email-automation.json     + email-automation.png
lead-gen-linkedin.json    + lead-gen-linkedin.png
seo-content-writer.json   + seo-content-writer.png
```

**❌ À éviter :**
```
Email Automation.json     (espaces, majuscules)
lead gen.json             (espaces)
seo-writer.json + seo.png (noms différents)
```

---

### ÉTAPE 2 : Upload dans Supabase Storage (1 min)

1. **Va sur [Supabase Dashboard](https://supabase.com/dashboard)** → Storage

2. **Upload le fichier JSON :**
   - Clique sur le bucket `workflows-json`
   - Clique sur **"Upload file"**
   - Sélectionne ton fichier `.json`

3. **Upload le screenshot :**
   - Clique sur le bucket `workflows-screenshots`
   - Clique sur **"Upload file"**
   - Sélectionne ton fichier `.png`

---

### ÉTAPE 3 : Ajouter dans la base de données (1 min)

1. **Va sur Supabase** → **SQL Editor**

2. **Copie ce template** et remplace les valeurs :

```sql
INSERT INTO workflows (
  json_filename,
  screenshot_filename,
  name,
  description
)
VALUES (
  'nom-du-fichier.json',           -- ← Nom EXACT du fichier JSON
  'nom-du-fichier.png',            -- ← Nom EXACT du screenshot
  'Titre du Workflow',             -- ← Titre à afficher sur le site
  'Description courte du workflow' -- ← Description
);

-- Vérifier
SELECT * FROM workflows WHERE json_filename = 'nom-du-fichier.json';
```

3. **Exécute le SQL**

---

### ÉTAPE 4 : Vérifier sur le site (30 secondes)

1. **Va sur ton site** : `https://ton-site.vercel.app/workflows?token=ton-token`
2. **Rafraîchis** la page (Ctrl+F5)
3. ✅ **Le workflow apparaît avec son screenshot !**

---

## 📋 EXEMPLE COMPLET

### Cas pratique : Ajouter "Email Automation Pro"

**1. Fichiers préparés :**
```
email-automation-pro.json
email-automation-pro.png
```

**2. Upload dans Storage :**
- `workflows-json/email-automation-pro.json` ✓
- `workflows-screenshots/email-automation-pro.png` ✓

**3. SQL à exécuter :**
```sql
INSERT INTO workflows (
  json_filename,
  screenshot_filename,
  name,
  description
)
VALUES (
  'email-automation-pro.json',
  'email-automation-pro.png',
  'Email Automation Pro',
  'Séquences d'emails automatisées avec segmentation et personnalisation IA.'
);
```

**4. Résultat :**
✅ Le workflow apparaît sur le site avec son titre, description et screenshot !

---

## 🎨 PERSONNALISER LE TITRE/DESCRIPTION

### Option A : Définir directement dans le SQL (simple)

Choisis ton titre et ta description dans le SQL ci-dessus.

### Option B : Créer un preset (pour réutilisation)

Si tu veux que le système génère automatiquement le titre/description pour ce workflow :

1. **Édite** `lib/workflowsMeta.ts`
2. **Ajoute** ton preset :

```typescript
export const WORKFLOW_PRESETS: Record<string, WorkflowMeta> = {
  // ... autres presets ...
  
  "email-automation-pro.json": {
    name: "Email Automation Pro",
    description: "Séquences d'emails automatisées avec segmentation IA."
  },
};
```

3. **Commit + push** sur GitHub
4. **Attends** le redéploiement Vercel (2 min)
5. **Utilise** le bouton "Mettre à jour les métadonnées" sur le site

---

## ⚡ TEMPLATE SQL RAPIDE

Copie-colle ce template et remplis les `[...]` :

```sql
-- =====================================================
-- AJOUT WORKFLOW : [NOM DU WORKFLOW]
-- =====================================================

INSERT INTO workflows (json_filename, screenshot_filename, name, description)
VALUES (
  '[nom-fichier].json',
  '[nom-fichier].png',
  '[Titre à afficher]',
  '[Description courte]'
);

-- Vérifier
SELECT id, name, json_filename, screenshot_filename 
FROM workflows 
WHERE json_filename = '[nom-fichier].json';
```

---

## 🛠️ DÉPANNAGE RAPIDE

### Problème : Screenshot ne s'affiche pas

**Cause :** Le nom du fichier dans la table ne correspond pas au nom dans Storage.

**Solution :**
```sql
-- Corriger le nom du screenshot
UPDATE workflows 
SET screenshot_filename = 'nom-exact-dans-storage.png'
WHERE json_filename = 'ton-fichier.json';
```

---

### Problème : Workflow n'apparaît pas

**Vérifications :**
1. ✅ Le SQL s'est exécuté sans erreur ?
2. ✅ Le fichier est bien uploadé dans Storage ?
3. ✅ Tu as rafraîchi la page du site ?

---

### Problème : Doublon (workflow déjà existant)

**Si tu veux le remplacer :**
```sql
-- Supprimer l'ancien
DELETE FROM workflows WHERE json_filename = 'ton-fichier.json';

-- Ré-insérer
INSERT INTO workflows (...) VALUES (...);
```

---

## 📊 CHECKLIST COMPLÈTE

**Avant d'ajouter un workflow :**
- [ ] Fichiers nommés correctement (tirets, minuscules, même nom de base)
- [ ] Fichier JSON uploadé dans `workflows-json`
- [ ] Screenshot PNG uploadé dans `workflows-screenshots`
- [ ] SQL préparé avec les bons noms
- [ ] SQL exécuté sur Supabase
- [ ] Site rafraîchi
- [ ] Workflow visible avec screenshot

---

## 🎯 RÉSUMÉ EN 3 ÉTAPES

```
1. Upload JSON + PNG dans Storage (même nom de base)
2. Exécute SQL INSERT avec les noms exacts
3. Rafraîchis le site → ✅ C'est en ligne !
```

---

## 💡 CONSEILS PRO

### Nommage cohérent
```
lead-gen-*.json       → Lead Generation
email-*.json          → Email Automation
seo-*.json            → SEO Optimization
scraping-*.json       → Web Scraping
social-*.json         → Social Media
```

### Descriptions efficaces
- ✅ 1 phrase courte (max 100 caractères)
- ✅ Mentionne le bénéfice principal
- ✅ Utilise des mots-clés (IA, automatique, optimisé)

### Screenshots de qualité
- ✅ Format PNG (meilleure qualité)
- ✅ Taille recommandée : 1200x800 px
- ✅ Montre le workflow n8n complet

---

🎉 **Voilà ! Tu peux maintenant ajouter des workflows en 5 minutes chrono !**
