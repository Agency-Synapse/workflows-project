# ⚡ QUICK START : Ajouter un workflow en 5 min

## 🎯 MÉTHODE RAPIDE (ce qui marche à 100%)

### 1️⃣ Prépare tes fichiers

**Règle :** Même nom de base, tirets, minuscules

```
✅ lead-gen-linkedin.json + lead-gen-linkedin.png
✅ email-automation.json  + email-automation.png
❌ Lead Gen.json          + lead-gen.png  (pas pareil !)
```

---

### 2️⃣ Upload dans Supabase Storage

- **Bucket `workflows-json`** → Upload le `.json`
- **Bucket `workflows-screenshots`** → Upload le `.png`

---

### 3️⃣ Exécute ce SQL

```sql
INSERT INTO workflows (json_filename, screenshot_filename, name, description)
VALUES (
  'ton-fichier.json',
  'ton-fichier.png',
  'Titre à Afficher',
  'Description courte'
);
```

---

### 4️⃣ Rafraîchis le site

Ctrl+F5 sur `/workflows` → ✅ C'est en ligne !

---

## 📋 TEMPLATE À COPIER-COLLER

Fichier : **`TEMPLATE-ADD-WORKFLOW.sql`**

Copie ce fichier, remplis les `[...]`, exécute sur Supabase.

---

## 🆘 SI SCREENSHOT NE S'AFFICHE PAS

```sql
-- 1. Vérifie le nom EXACT dans Storage
-- 2. Corrige dans la table :
UPDATE workflows 
SET screenshot_filename = 'nom-exact.png'
WHERE json_filename = 'ton-fichier.json';
```

---

## 📁 FICHIERS UTILES

- `GUIDE-SIMPLE-AJOUTER-WORKFLOW.md` → Guide complet détaillé
- `TEMPLATE-ADD-WORKFLOW.sql` → Template SQL avec exemples
- `sql-fix-screenshot-exact.sql` → Corriger un screenshot

---

🚀 **C'est tout ! Simple et efficace.**
