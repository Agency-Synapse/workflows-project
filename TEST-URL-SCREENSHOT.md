# 🧪 Tester l'URL du screenshot

## 🔍 Problème : Screenshot ne s'affiche pas

Si tu vois l'icône **✨ Sparkles** au lieu du screenshot, c'est que l'image n'arrive pas à charger.

---

## ✅ ÉTAPE 1 : Vérifier le nom du fichier dans Storage

1. Va sur **Supabase Dashboard** → **Storage** → **workflows-screenshots**
2. Cherche le fichier pour "Veille IA 8H"
3. Note **EXACTEMENT** le nom :
   - Avec ou sans espaces ?
   - Majuscules/minuscules ?
   - Extension (.png, .jpg, .jpeg) ?

**Exemples possibles :**
```
✅ "Veille IA 8H.png"        (avec espaces)
✅ "veille-ia-8h.png"        (avec tirets)
✅ "Veille_IA_8H.png"        (avec underscores)
✅ "veille ia 8h.png"        (tout en minuscules)
```

---

## ✅ ÉTAPE 2 : Construire l'URL du screenshot

**Format de l'URL :**
```
https://genbzwagezbczhnfcguo.supabase.co/storage/v1/object/public/workflows-screenshots/[NOM-DU-FICHIER]
```

**⚠️ IMPORTANT : Les espaces sont encodés en `%20`**

**Exemples d'URLs :**

Si le fichier s'appelle `Veille IA 8H.png` :
```
https://genbzwagezbczhnfcguo.supabase.co/storage/v1/object/public/workflows-screenshots/Veille%20IA%208H.png
```

Si le fichier s'appelle `veille-ia-8h.png` :
```
https://genbzwagezbczhnfcguo.supabase.co/storage/v1/object/public/workflows-screenshots/veille-ia-8h.png
```

---

## ✅ ÉTAPE 3 : Tester l'URL dans le navigateur

1. **Copie l'URL** correspondant au nom de ton fichier
2. **Colle dans un nouvel onglet** de navigateur
3. **Résultat attendu :**
   - ✅ **L'image s'affiche** → Le nom est correct !
   - ❌ **Erreur 404** → Le nom ne correspond pas

---

## ✅ ÉTAPE 4 : Corriger dans la table workflows

Une fois que tu as trouvé le **nom exact**, corrige-le dans la base :

1. Ouvre `sql-fix-screenshot-veille-ia.sql`
2. Décommente l'option correspondante
3. Remplace par le nom exact trouvé
4. Exécute le SQL sur Supabase
5. Rafraîchis ton site
6. ✅ Le screenshot devrait s'afficher !

---

## 🐛 CAUSES COURANTES

### Cause 1 : Espaces dans le nom de fichier

**Problème :** Le fichier s'appelle `Veille IA 8H.png` (avec espaces)

**Solution :**
```sql
UPDATE workflows 
SET screenshot_filename = 'Veille IA 8H.png'
WHERE json_filename = 'Veille IA 8H.json';
```

---

### Cause 2 : Nom différent entre JSON et screenshot

**Problème :** 
- JSON : `Veille IA 8H.json`
- Screenshot : `veille-ia-8h.png` (différent !)

**Solution :** Renomme le fichier dans Storage pour qu'il corresponde, ou mets à jour la table.

---

### Cause 3 : Extension différente

**Problème :** Tu penses que c'est `.png` mais c'est `.jpg`

**Solution :**
```sql
UPDATE workflows 
SET screenshot_filename = 'Veille IA 8H.jpg'  -- ou .jpeg
WHERE json_filename = 'Veille IA 8H.json';
```

---

### Cause 4 : Bucket non public

**Problème :** Le bucket `workflows-screenshots` n'est pas public

**Solution :**
1. Va sur Supabase → Storage → `workflows-screenshots`
2. Clique sur **...** → **Edit bucket**
3. Coche **"Public bucket"**
4. Save

---

## 🎯 TEST RAPIDE

**Copie cette commande dans la console de ton site (F12 → Console) :**

```javascript
console.log("URL screenshot:", 
  `https://genbzwagezbczhnfcguo.supabase.co/storage/v1/object/public/workflows-screenshots/${encodeURIComponent('Veille IA 8H.png')}`
);
```

**Résultat :**
```
URL screenshot: https://genbzwagezbczhnfcguo.supabase.co/storage/v1/object/public/workflows-screenshots/Veille%20IA%208H.png
```

Copie cette URL et teste-la dans un nouvel onglet !

---

## 📋 CHECKLIST

- [ ] Nom exact du fichier vérifié dans Storage
- [ ] URL testée dans le navigateur → image s'affiche
- [ ] screenshot_filename mis à jour dans la table workflows
- [ ] Site rafraîchi
- [ ] Screenshot s'affiche correctement

---

**🚀 Une fois que tu as le nom exact, exécute le SQL de correction et le screenshot apparaîtra !**
