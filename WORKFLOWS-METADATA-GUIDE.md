# 📚 Guide d'utilisation : Système de métadonnées des workflows

## 🎯 Vue d'ensemble

Le système de métadonnées génère **automatiquement** des titres et descriptions pour tes workflows n8n, même si tu ne les remplis pas manuellement dans la base de données.

### Comment ça fonctionne ?

1. **Presets** : Pour les workflows courants, on a des métadonnées pré-définies dans `lib/workflowsMeta.ts`
2. **Génération automatique** : Si pas de preset, le système génère un titre/description à partir du nom du fichier
3. **Sync optionnel** : Tu peux synchroniser ces métadonnées vers la base avec un bouton

---

## 🚀 Ajouter un nouveau workflow (méthode rapide)

### Étape 1 : Upload des fichiers dans Supabase Storage

1. Va sur Supabase Dashboard → Storage
2. Upload le fichier JSON dans le bucket `workflows-json`
3. Upload le screenshot PNG dans le bucket `workflows-screenshots`

### Étape 2 : Ajouter la ligne dans la table `workflows`

Deux options :

**Option A : Laisse les métadonnées vides (recommandé si tu utilises un preset)**

```sql
INSERT INTO workflows (json_filename, screenshot_filename)
VALUES (
  'mon-nouveau-workflow.json',
  'mon-screenshot.png'
);
```

→ Le système va automatiquement générer le titre/description à partir du preset ou du nom du fichier.

**Option B : Remplis tout manuellement**

```sql
INSERT INTO workflows (json_filename, screenshot_filename, name, description)
VALUES (
  'mon-nouveau-workflow.json',
  'mon-screenshot.png',
  'Titre personnalisé',
  'Description personnalisée du workflow'
);
```

### Étape 3 : Vérifie sur le site

1. Va sur `/workflows?token=ton-token`
2. Le workflow apparaît avec son titre/description généré(e) ou personnalisé(e)
3. (Optionnel) Clique sur **"Mettre à jour les métadonnées"** pour sauvegarder dans la base

---

## ⚙️ Ajouter un nouveau preset

Si tu veux définir des métadonnées fixes pour un nouveau workflow (ex: `email-automation.json`), ajoute-le dans `lib/workflowsMeta.ts`.

### Fichier : `lib/workflowsMeta.ts`

```typescript
export const WORKFLOW_PRESETS: Record<string, WorkflowMeta> = {
  "search-console-reports.json": {
    name: "Workflow SEO Pro",
    description: "Génération automatique de rapports SEO depuis Google Search Console vers Google Sheets."
  },
  "landing-page-cro-audit.json": {
    name: "CRO & A/B Testing",
    description: "Analyse automatique de landing pages avec suggestions d'optimisation CRO par IA."
  },
  
  // ✅ AJOUTE TON NOUVEAU PRESET ICI
  "email-automation.json": {
    name: "Email Automation Pro",
    description: "Séquences d'emails automatisées avec segmentation et personnalisation IA."
  },
  
  // Autre exemple
  "scraping-linkedin.json": {
    name: "LinkedIn Scraper",
    description: "Extraction automatique de profils et d'entreprises depuis LinkedIn."
  }
};
```

### Fallback automatique par mots-clés

Si tu ne veux pas créer un preset, le système détecte automatiquement le type de workflow à partir du nom du fichier :

- Fichier contenant `seo` → "Workflow d'optimisation SEO..."
- Fichier contenant `lead` → "Automatisation de la prospection..."
- Fichier contenant `cro` → "Analyse et optimisation du taux de conversion..."
- Fichier contenant `email` → "Automatisation d'emails..."
- Fichier contenant `scraping` → "Extraction automatique de données..."
- Fichier contenant `social` / `instagram` / `tiktok` → "Automatisation de posts..."
- Sinon → "Workflow d'automatisation n8n prêt à l'emploi."

Et pour le titre, il transforme automatiquement :
- `lead-gen.json` → **"Lead Gen"**
- `email-automation.json` → **"Email Automation"**
- `search-console-reports.json` → **"Search Console Reports"**

---

## 🔄 Synchroniser les métadonnées vers la base

### Depuis l'interface web

1. Va sur `/workflows?token=ton-token`
2. Scroll en bas de la page
3. Clique sur le bouton **"Mettre à jour les métadonnées"**
4. Le système va :
   - Lire tous les workflows
   - Pour ceux sans `name` ou `description` :
     - Générer les métadonnées (preset ou automatique)
     - Faire un `UPDATE` dans Supabase
   - Recharger la liste mise à jour

### Depuis du code / script

Tu peux aussi appeler la fonction directement dans un script :

```typescript
import { syncWorkflowsMetaToSupabase } from '@/lib/workflowsMeta';
import { getSupabaseClient } from '@/lib/supabase';

async function syncAll() {
  const supabase = getSupabaseClient();
  const { data: workflows } = await supabase
    .from('workflows')
    .select('*');
  
  if (workflows) {
    const result = await syncWorkflowsMetaToSupabase(workflows);
    console.log(`✅ Sync terminé: ${result.success} workflows mis à jour`);
  }
}

syncAll();
```

---

## 📝 Résumé des 3 approches

| Approche | Utilisation | Avantages |
|----------|-------------|-----------|
| **Preset** | Workflows récurrents / pro | Métadonnées sur-mesure, cohérentes |
| **Génération auto** | Workflows occasionnels | Zéro config, titre/description automatiques |
| **Manuel** | Workflows uniques | Contrôle total sur le wording |

---

## 🛠️ Structure SQL de la table `workflows`

```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  json_filename TEXT NOT NULL,          -- Ex: "lead-gen.json"
  screenshot_filename TEXT,             -- Ex: "lead-gen.png"
  name TEXT,                            -- Ex: "Lead Gen LinkedIn"
  description TEXT,                     -- Ex: "Extraction et qualification..."
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workflows DISABLE ROW LEVEL SECURITY;
```

---

## ❓ FAQ

### Que se passe-t-il si je ne remplis pas `name` et `description` ?

→ Le système les génère automatiquement à l'affichage (côté front). Elles ne sont pas sauvegardées dans la base tant que tu n'as pas cliqué sur le bouton "Mettre à jour les métadonnées".

### Est-ce que je peux modifier manuellement les métadonnées dans Supabase ?

→ Oui ! Si tu modifies `name` ou `description` dans la table Supabase, elles seront utilisées en priorité et ne seront pas écrasées par le système de génération.

### Comment voir les métadonnées générées sans les sauvegarder ?

→ Regarde la console du navigateur (F12) sur la page `/workflows`. Les métadonnées générées sont loggées.

### Puis-je supprimer un preset ?

→ Oui, supprime simplement la ligne correspondante dans `WORKFLOW_PRESETS` dans `lib/workflowsMeta.ts`. Le workflow utilisera alors la génération automatique.

---

## 🎨 Exemple complet

### Fichier : `prospection-linkedin.json`

**Étape 1 : Upload dans Supabase Storage**
- `workflows-json/prospection-linkedin.json`
- `workflows-screenshots/prospection-linkedin.png`

**Étape 2 : INSERT dans la table**

```sql
INSERT INTO workflows (json_filename, screenshot_filename)
VALUES ('prospection-linkedin.json', 'prospection-linkedin.png');
```

**Étape 3 : Résultat sur le site**

Sans preset → génération automatique :
- **Titre** : "Prospection LinkedIn"
- **Description** : "Automatisation de la prospection et qualification de leads."

Avec preset dans `lib/workflowsMeta.ts` :

```typescript
"prospection-linkedin.json": {
  name: "LinkedIn Prospecting Pro",
  description: "Extraction automatique de leads LinkedIn avec qualification IA et enrichissement des profils."
}
```

→ Affichera le preset au lieu de la génération auto.

---

🎉 **Tu es prêt ! Ajoute des workflows et laisse le système gérer les métadonnées automatiquement.**
