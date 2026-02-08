# 🚀 Guide : Ajouter un nouveau workflow

## 📋 Processus simple en 3 étapes

### ÉTAPE 1 : Upload dans Supabase Storage

1. Va sur [Supabase Dashboard](https://supabase.com/dashboard) → Storage
2. **Upload le fichier JSON** :
   - Va dans le bucket `workflows-json`
   - Clique sur "Upload file"
   - Sélectionne ton fichier `.json` (ex: `email-automation.json`)
3. **Upload le screenshot** :
   - Va dans le bucket `workflows-screenshots`
   - Clique sur "Upload file"
   - Sélectionne ton fichier `.png` (ex: `email-automation.png`)

**⚠️ IMPORTANT : Le nom de base doit être identique**
```
✅ Correct :
- workflows-json/email-automation.json
- workflows-screenshots/email-automation.png

❌ Incorrect :
- workflows-json/email-automation.json
- workflows-screenshots/email.png  ← nom différent !
```

---

### ÉTAPE 2 : Synchroniser depuis le site

1. Va sur ton site : `https://ton-site.vercel.app/workflows?token=ton-token`
2. Scroll en bas de la page
3. Clique sur le bouton **"Synchroniser depuis Storage"**
4. Attends 2-3 secondes
5. ✅ Un message apparaît : "1 workflow(s) ajouté(s)"

**Le workflow apparaît instantanément dans la liste !**

---

### ÉTAPE 3 : Vérifier (optionnel)

1. Va sur Supabase → Table Editor → `workflows`
2. Tu devrais voir ta nouvelle ligne :
   ```
   id: [auto]
   json_filename: email-automation.json
   screenshot_filename: email-automation.png
   name: Email Automation  ← Généré automatiquement !
   description: Automatisation d'emails...  ← Généré automatiquement !
   ```

---

## 🎨 Personnaliser le titre/description

Par défaut, le système génère automatiquement un titre/description à partir du nom du fichier.

### Génération automatique par mots-clés

Le système détecte des mots-clés dans le nom du fichier :

| Mots-clés | Titre généré | Description |
|-----------|--------------|-------------|
| `seo` | "SEO Optimization" | "Workflow d'optimisation SEO..." |
| `lead`, `prospect` | "Lead Generation" | "Automatisation de la prospection..." |
| `cro`, `conversion` | "CRO Testing" | "Analyse et optimisation du taux de conversion..." |
| `email`, `mail` | "Email Automation" | "Automatisation d'emails..." |
| `scraping`, `scrape` | "Web Scraping" | "Extraction automatique de données..." |
| `social`, `instagram`, `tiktok` | "Social Media" | "Automatisation de posts..." |
| Autre | Capitalisation du nom | "Workflow d'automatisation n8n..." |

**Exemples :**
```
lead-gen-linkedin.json     → "Lead Gen Linkedin"
email-automation-pro.json  → "Email Automation Pro"
seo-content-writer.json    → "SEO Content Writer"
```

---

### Créer un preset personnalisé

Si tu veux un titre/description spécifique pour un workflow, ajoute-le dans `lib/workflowsMeta.ts` :

1. Ouvre `lib/workflowsMeta.ts`
2. Ajoute ton preset dans `WORKFLOW_PRESETS` :

```typescript
export const WORKFLOW_PRESETS: Record<string, WorkflowMeta> = {
  // ... presets existants ...
  
  // 🆕 TON NOUVEAU PRESET
  "email-automation.json": {
    name: "Email Automation Pro",
    description: "Séquences d'emails automatisées avec segmentation et personnalisation IA."
  },
};
```

3. Commit + push sur GitHub
4. Vercel redéploie automatiquement
5. Clique sur "Mettre à jour les métadonnées" sur le site
6. ✅ Le titre/description personnalisé s'applique !

---

## 🔄 Workflow complet : Nouvel ajout

### Avec génération automatique (simple)

```
1. Upload JSON dans workflows-json ✓
2. Upload PNG dans workflows-screenshots ✓
3. Clic "Synchroniser depuis Storage" sur le site ✓
4. ✅ Workflow ajouté avec métadonnées auto !
```

### Avec preset personnalisé (contrôle total)

```
1. Upload JSON dans workflows-json ✓
2. Upload PNG dans workflows-screenshots ✓
3. Édite lib/workflowsMeta.ts (ajoute ton preset) ✓
4. Commit + push GitHub ✓
5. Attends le redéploiement Vercel (1-2 min) ✓
6. Clic "Synchroniser depuis Storage" ✓
7. Clic "Mettre à jour les métadonnées" ✓
8. ✅ Workflow avec ton titre/description custom !
```

---

## 🛠️ Fonctionnalités avancées

### Bouton "Synchroniser depuis Storage"

**Ce qu'il fait :**
1. Liste tous les fichiers JSON dans `workflows-json`
2. Liste tous les fichiers PNG dans `workflows-screenshots`
3. Compare avec la table `workflows`
4. Insère uniquement les nouveaux workflows
5. Associe automatiquement JSON + screenshot par nom
6. Génère titre/description automatiquement

**Quand l'utiliser :**
- Après avoir uploadé un nouveau fichier dans Storage
- Pour vérifier qu'un workflow a bien été ajouté
- Pour récupérer des workflows après un nettoyage de table

### Bouton "Mettre à jour les métadonnées"

**Ce qu'il fait :**
1. Scanne tous les workflows de la table
2. Pour chaque workflow sans `name` ou `description` :
   - Génère les métadonnées depuis le preset ou le nom de fichier
   - Met à jour la ligne dans la table

**Quand l'utiliser :**
- Après avoir ajouté un nouveau preset dans `workflowsMeta.ts`
- Pour régénérer les métadonnées de tous les workflows
- Si tu as modifié un preset existant

---

## 📊 Résolution de problèmes

### Problème : "Aucun nouveau workflow à ajouter"

**Cause :** Le workflow existe déjà dans la table.

**Solution :**
1. Va sur Supabase → Table Editor → `workflows`
2. Vérifie si le fichier est déjà présent (colonne `json_filename`)
3. Si oui et que tu veux le réajouter :
   - Supprime la ligne dans la table
   - Reclique sur "Synchroniser depuis Storage"

---

### Problème : "Pas de screenshot trouvé pour X"

**Cause :** Le nom du screenshot ne correspond pas au nom du JSON.

**Solution :**
1. Vérifie que les noms correspondent :
   ```
   ✅ email-automation.json + email-automation.png
   ❌ email-automation.json + email.png
   ```
2. Renomme le fichier dans Storage ou re-upload avec le bon nom
3. Reclique sur "Synchroniser depuis Storage"

---

### Problème : Titre/description génériques

**Cause :** Pas de preset défini pour ce fichier, génération automatique basique.

**Solution :**
- Soit : Accepte le titre/description auto (ex: "Email Automation")
- Soit : Crée un preset personnalisé dans `workflowsMeta.ts` (voir ci-dessus)

---

## 🎯 Exemples complets

### Exemple 1 : Workflow simple

**Fichiers :**
- `scraping-linkedin.json`
- `scraping-linkedin.png`

**Résultat auto :**
- Titre : "Scraping Linkedin"
- Description : "Extraction automatique de données depuis le web."

---

### Exemple 2 : Workflow avec preset

**Fichiers :**
- `lead-gen-advanced.json`
- `lead-gen-advanced.png`

**Preset dans `workflowsMeta.ts` :**
```typescript
"lead-gen-advanced.json": {
  name: "Lead Gen Pro - LinkedIn & Apollo",
  description: "Extraction de leads LinkedIn avec enrichissement Apollo.io et qualification IA."
}
```

**Résultat :**
- Titre : "Lead Gen Pro - LinkedIn & Apollo"
- Description : "Extraction de leads LinkedIn..."

---

## ✅ Checklist rapide

**Pour ajouter un workflow :**
- [ ] Fichier JSON uploadé dans `workflows-json`
- [ ] Screenshot PNG uploadé dans `workflows-screenshots`
- [ ] Noms de fichiers correspondent (même base)
- [ ] Clic sur "Synchroniser depuis Storage"
- [ ] Workflow apparaît dans la liste
- [ ] (Optionnel) Preset créé dans `workflowsMeta.ts`
- [ ] (Optionnel) Clic sur "Mettre à jour les métadonnées"

---

🎉 **C'est tout ! Ton système est maintenant entièrement automatisé.**
