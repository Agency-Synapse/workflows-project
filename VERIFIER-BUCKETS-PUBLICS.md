# 🔍 Vérifier que les buckets Storage sont publics

## ❓ Pourquoi le sync ne trouve pas les fichiers ?

Si `totalFiles: 0`, c'est que l'API n'arrive pas à lister les fichiers du bucket.

**Causes possibles :**
1. ❌ Les buckets ne sont pas publics
2. ❌ Mauvaises permissions (RLS bloque l'accès)
3. ❌ Les fichiers sont dans un sous-dossier

---

## ✅ SOLUTION 1 : Rendre les buckets publics

### 1. Va sur Supabase Dashboard

1. Ouvre [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionne ton projet
3. Va dans **Storage** (icône 📦 dans le menu de gauche)

### 2. Vérifie le bucket `workflows-json`

1. Clique sur le bucket `workflows-json`
2. Regarde en haut à droite : il doit y avoir un badge **"PUBLIC"**
   - ✅ Si tu vois "PUBLIC" → c'est bon !
   - ❌ Si tu vois "PRIVATE" → il faut le rendre public

### 3. Rendre un bucket public

1. Clique sur **...** (3 points) à côté du nom du bucket
2. Clique sur **Edit bucket**
3. **Coche** la case **"Public bucket"**
4. Clique sur **Save**

### 4. Répète pour `workflows-screenshots`

Fais la même chose pour le bucket `workflows-screenshots`.

---

## ✅ SOLUTION 2 : Vérifier que les fichiers sont à la racine

1. Va dans le bucket `workflows-json`
2. Les fichiers doivent être **directement à la racine**, pas dans un sous-dossier

**✅ Correct :**
```
workflows-json/
  ├── CLAUDE.md
  ├── landing-page-cro-audit.json
  ├── search-console-reports.json
  └── Veille IA 8H.json
```

**❌ Incorrect :**
```
workflows-json/
  └── mon-dossier/
      ├── CLAUDE.md
      └── Veille IA 8H.json
```

---

## ✅ SOLUTION 3 : Ajouter manuellement via SQL (méthode alternative)

Si tu ne veux pas t'embêter avec les permissions Storage, **ajoute directement le workflow via SQL** :

1. Ouvre `sql-add-veille-ia.sql` (je viens de le créer)
2. Copie tout le contenu
3. Va sur Supabase → SQL Editor
4. Colle et exécute
5. ✅ Le workflow apparaît instantanément sur le site !

---

## 🧪 Tester l'accès public

Pour vérifier que ton bucket est bien public, teste cette URL dans ton navigateur :

```
https://genbzwagezbczhnfcguo.supabase.co/storage/v1/object/public/workflows-json/CLAUDE.md
```

**✅ Si ça affiche le contenu du fichier** → Le bucket est public  
**❌ Si erreur 400/403** → Le bucket n'est pas public

---

## 📊 Résumé des vérifications

| Vérification | Comment | Résultat attendu |
|--------------|---------|------------------|
| Bucket public | Storage → workflows-json → badge "PUBLIC" | ✅ PUBLIC |
| Fichiers à la racine | Pas de sous-dossiers | ✅ Racine |
| URL publique fonctionne | Ouvre l'URL dans le navigateur | ✅ Fichier affiché |

---

## 🎯 Après avoir rendu les buckets publics

1. **Redéploie sur Vercel** (ou attends le déploiement auto)
2. Va sur ton site : `/workflows?token=ton-token`
3. Clique sur **"Synchroniser depuis Storage"**
4. ✅ Cette fois, ça devrait trouver les 4 fichiers !

---

🚀 **Si ça ne marche toujours pas après avoir rendu les buckets publics, utilise la méthode SQL directe.**
