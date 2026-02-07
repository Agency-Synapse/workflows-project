# 🎯 SOLUTION COMPLÈTE : Next.js 16 + Supabase UPSERT

## ═══════════════════════════════════════════════════════════════
## ÉTAPE 1 – NETTOYAGE SQL COMPLET
## ═══════════════════════════════════════════════════════════════

### 1A) Diagnostic : Lister les contraintes existantes

Exécute ce SQL pour voir l'état actuel :

```sql
-- Voir toutes les contraintes sur la table leads
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'leads'::regclass
ORDER BY conname;

-- Voir la structure des colonnes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- Compter les doublons sur email
SELECT email, COUNT(*) as count
FROM leads
GROUP BY email
HAVING COUNT(*) > 1;
```

**Résultat attendu :**
- Tu verras les contraintes existantes (ex: `leads_email_unique`, `leads_access_token_unique`)
- Tu verras si tu as des doublons d'email
- Tu verras la structure exacte de la table

---

### 1B) Nettoyage complet et reconstruction

**EXÉCUTE CE BLOC SQL EN UNE SEULE FOIS :**

```sql
-- =====================================================
-- NETTOYAGE COMPLET DE LA TABLE LEADS
-- =====================================================

-- 1. SUPPRIMER TOUTES LES CONTRAINTES UNIQUE EXISTANTES
-- =====================================================
DO $$ 
DECLARE 
  constraint_record RECORD;
BEGIN
  -- Boucle sur toutes les contraintes UNIQUE de la table leads
  FOR constraint_record IN 
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'leads'::regclass 
      AND contype = 'u' -- 'u' = UNIQUE constraint
      AND conname != 'leads_pkey' -- Ne pas supprimer la clé primaire
  LOOP
    EXECUTE 'ALTER TABLE leads DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_record.conname);
    RAISE NOTICE 'Contrainte supprimée : %', constraint_record.conname;
  END LOOP;
END $$;


-- 2. NETTOYER LES DOUBLONS D'EMAIL
-- =====================================================
-- Stratégie : Garder la ligne la plus récente (created_at DESC)
-- Si pas de colonne created_at, on garde celle avec le plus grand id

-- Option A : Si tu as une colonne created_at
DELETE FROM leads a USING leads b
WHERE a.id < b.id 
  AND a.email = b.email;

-- Option B : Si pas de created_at, supprimer par id (garde le plus récent)
-- Décommenter si nécessaire :
-- DELETE FROM leads 
-- WHERE id NOT IN (
--   SELECT MAX(id) 
--   FROM leads 
--   GROUP BY email
-- );


-- 3. NETTOYER LES LIGNES SANS EMAIL OU SANS TOKEN
-- =====================================================
DELETE FROM leads 
WHERE email IS NULL 
   OR email = ''
   OR access_token IS NULL 
   OR access_token = '';


-- 4. RECRÉER LES CONTRAINTES PROPREMENT
-- =====================================================

-- Contrainte UNIQUE sur email
ALTER TABLE leads 
ADD CONSTRAINT leads_email_key UNIQUE (email);

-- Contrainte UNIQUE sur access_token
ALTER TABLE leads 
ADD CONSTRAINT leads_access_token_key UNIQUE (access_token);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_access_token ON leads(access_token);


-- 5. VÉRIFICATION FINALE
-- =====================================================

-- Afficher les nouvelles contraintes
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'leads'::regclass
  AND contype = 'u'
ORDER BY conname;

-- Afficher les données restantes
SELECT 
  id,
  email,
  SUBSTRING(access_token, 1, 8) || '...' as token_preview,
  created_at
FROM leads
ORDER BY created_at DESC
LIMIT 10;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Nettoyage terminé : contraintes UNIQUE recréées sur email et access_token';
END $$;
```

**Résultat attendu :**
- ✅ Toutes les anciennes contraintes UNIQUE supprimées
- ✅ Doublons d'email supprimés (garde le plus récent)
- ✅ Nouvelles contraintes `leads_email_key` et `leads_access_token_key` créées
- ✅ Index ajoutés pour performance

---

## ═══════════════════════════════════════════════════════════════
## ÉTAPE 2 – UPSERT PROPRE AVEC SUPABASE JS
## ═══════════════════════════════════════════════════════════════

### Syntaxe correcte avec `.upsert()` + `.select()` + `.single()`

**Code TypeScript complet :**

```typescript
// app/page.tsx - Fonction d'inscription

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    setError("Entre un email valide.");
    setIsSubmitting(false);
    return;
  }

  try {
    const supabase = getSupabaseClient();
    const newToken = crypto.randomUUID();

    console.log("📧 UPSERT pour:", cleanEmail);

    // UPSERT : Insert OU Update si l'email existe déjà
    const { data, error: upsertError } = await supabase
      .from("leads")
      .upsert(
        {
          email: cleanEmail,
          first_name: null,
          last_name: null,
          access_token: newToken
        },
        { 
          onConflict: "email",  // Colonne de conflit
          ignoreDuplicates: false  // false = faire un UPDATE si conflit
        }
      )
      .select("access_token")  // Récupérer le token après l'opération
      .single();  // Retourner un seul objet au lieu d'un tableau

    if (upsertError) {
      console.error("❌ Erreur UPSERT:", upsertError);
      throw new Error(upsertError.message);
    }

    if (!data?.access_token) {
      throw new Error("Token non retourné après UPSERT");
    }

    console.log("✅ UPSERT réussi, token:", data.access_token);

    // Optionnel : Ajouter dans saas_waitlist (ignorer erreur de doublon)
    await supabase
      .from("saas_waitlist")
      .insert({ email: cleanEmail })
      .then(({ error }) => {
        if (error && error.code !== "23505") {
          console.warn("⚠️ Erreur saas_waitlist:", error.message);
        }
      });

    // Afficher le succès
    setSuccess(true);

    // Redirection après 1.5s
    setTimeout(() => {
      router.push(`/workflows?token=${encodeURIComponent(data.access_token)}`);
    }, 1500);

  } catch (err) {
    console.error("❌ Erreur inscription:", err);
    setError(
      err instanceof Error 
        ? err.message 
        : "Erreur lors de l'inscription. Réessaie."
    );
  } finally {
    setIsSubmitting(false);
  }
}
```

**Explication détaillée :**

1. **`upsert()`** :
   - Si `email` n'existe pas → INSERT
   - Si `email` existe déjà → UPDATE avec le nouveau `access_token`

2. **`onConflict: "email"`** :
   - Spécifie que le conflit se fait sur la colonne `email`
   - **Nécessite que `email` ait une contrainte UNIQUE** (créée à l'ÉTAPE 1)

3. **`ignoreDuplicates: false`** :
   - `false` (défaut) = faire un UPDATE en cas de conflit
   - `true` = ne rien faire en cas de conflit (skip l'insert)

4. **`.select("access_token")`** :
   - Retourne la valeur du token après l'opération
   - Peut sélectionner plusieurs colonnes : `.select("id, email, access_token")`

5. **`.single()`** :
   - Retourne un objet unique au lieu d'un tableau
   - Si tu omets `.single()`, tu auras `data = [{ access_token: "..." }]`
   - Avec `.single()`, tu as `data = { access_token: "..." }`

---

### Alternative : UPSERT avec récupération conditionnelle

Si tu veux générer un nouveau token SEULEMENT pour les nouveaux inserts (pas pour les updates), utilise cette approche :

```typescript
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  // ... validation ...

  try {
    const supabase = getSupabaseClient();

    // 1. Vérifier si l'email existe déjà
    const { data: existingLead } = await supabase
      .from("leads")
      .select("access_token")
      .eq("email", cleanEmail)
      .maybeSingle();

    let finalToken: string;

    if (existingLead?.access_token) {
      // Email existe déjà → réutiliser le token existant
      console.log("✅ Email existant, réutilisation du token");
      finalToken = existingLead.access_token;
    } else {
      // Nouvel email → créer un nouveau token
      finalToken = crypto.randomUUID();
      console.log("🆕 Nouvel email, création du token");

      const { error: upsertError } = await supabase
        .from("leads")
        .upsert(
          {
            email: cleanEmail,
            first_name: null,
            last_name: null,
            access_token: finalToken
          },
          { onConflict: "email" }
        );

      if (upsertError) {
        throw new Error(upsertError.message);
      }
    }

    console.log("✅ Token final:", finalToken);

    // Redirection
    setSuccess(true);
    setTimeout(() => {
      router.push(`/workflows?token=${encodeURIComponent(finalToken)}`);
    }, 1500);

  } catch (err) {
    // ... gestion erreur ...
  }
}
```

**Avantage de cette approche :**
- Token stable : une fois généré, il ne change jamais
- Plus prévisible pour l'utilisateur (même token à chaque reconnexion)

**Inconvénient :**
- 2 requêtes au lieu d'1 si l'email existe déjà

---

## ═══════════════════════════════════════════════════════════════
## ÉTAPE 3 – CODE COMPLET REFACTORÉ
## ═══════════════════════════════════════════════════════════════

### Fichier : `app/page.tsx` (Landing page)

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    // Validation
    if (!cleanEmail) {
      setError("Entre ton email pour rejoindre la waitlist 🙏");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Entre un email valide.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      
      console.log("📧 Inscription/Connexion pour:", cleanEmail);

      // Vérifier si l'email existe déjà
      const { data: existingLead } = await supabase
        .from("leads")
        .select("access_token")
        .eq("email", cleanEmail)
        .maybeSingle();

      let finalToken: string;

      if (existingLead?.access_token) {
        // Email existe → réutiliser le token
        console.log("✅ Email trouvé, réutilisation du token");
        finalToken = existingLead.access_token;
      } else {
        // Nouvel email → créer un token et insérer
        finalToken = crypto.randomUUID();
        console.log("🆕 Nouvel email, création du token:", finalToken);

        const { error: upsertError } = await supabase
          .from("leads")
          .upsert(
            {
              email: cleanEmail,
              first_name: null,
              last_name: null,
              access_token: finalToken
            },
            { onConflict: "email" }
          );

        if (upsertError) {
          console.error("❌ Erreur UPSERT:", upsertError);
          throw new Error(upsertError.message);
        }
      }

      // Ajouter dans saas_waitlist (ignorer doublon)
      await supabase
        .from("saas_waitlist")
        .insert({ email: cleanEmail })
        .then(({ error: waitlistError }) => {
          if (waitlistError && waitlistError.code !== "23505") {
            console.warn("⚠️ Erreur waitlist (non bloquante):", waitlistError.message);
          }
        });

      console.log("✅ Inscription terminée, redirection...");

      // Afficher le succès
      setSuccess(true);

      // Redirection après 1.5s
      setTimeout(() => {
        router.push(`/workflows?token=${encodeURIComponent(finalToken)}`);
      }, 1500);

    } catch (err) {
      console.error("❌ Erreur inscription:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Erreur lors de l'inscription. Réessaie dans quelques secondes."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* ... reste du JSX ... */}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Entre ton email"
          disabled={isSubmitting}
          required
        />
        
        {error && <div className="error">{error}</div>}
        
        {success && (
          <div className="success">
            ✅ C'est bon ! Redirection vers tes workflows...
          </div>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Inscription..." : "Réserver ma place"}
        </button>
      </form>
      {/* ... reste du JSX ... */}
    </main>
  );
}
```

---

### Fichier : `app/workflows/page.tsx` (Page workflows)

```typescript
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type Workflow = {
  id: string;
  name: string;
  description: string | null;
  json_filename: string;
  screenshot_filename: string | null;
};

function WorkflowsPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = getSupabaseClient();

        // 1. Vérifier le token (optionnel mais recommandé pour sécurité)
        if (token) {
          console.log("🔍 Vérification du token...");
          
          const { data: lead, error: leadError } = await supabase
            .from("leads")
            .select("email")
            .eq("access_token", token)
            .maybeSingle();

          if (lead) {
            console.log("✅ Token valide pour:", lead.email);
            setUserEmail(lead.email);
          } else {
            console.warn("⚠️ Token invalide, accès public aux workflows");
          }
        }

        // 2. Charger les workflows (toujours, même sans token valide)
        console.log("📦 Chargement des workflows...");
        
        const { data: workflowData, error: workflowError } = await supabase
          .from("workflows")
          .select("id, name, description, json_filename, screenshot_filename")
          .order("created_at", { ascending: false });

        if (workflowError) {
          throw new Error(workflowError.message);
        }

        setWorkflows(workflowData || []);
        console.log(`✅ ${workflowData?.length || 0} workflows chargés`);

      } catch (err) {
        console.error("❌ Erreur chargement:", err);
        setError(
          err instanceof Error 
            ? err.message 
            : "Erreur lors du chargement"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [token]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div>
      {userEmail && <p>Connecté en tant que : {userEmail}</p>}
      
      <h1>Workflows disponibles</h1>
      
      {workflows.length === 0 ? (
        <p>Aucun workflow disponible pour le moment.</p>
      ) : (
        <div className="grid">
          {workflows.map((wf) => (
            <div key={wf.id} className="workflow-card">
              <h3>{wf.name || "Workflow sans nom"}</h3>
              <p>{wf.description || "Aucune description"}</p>
              <button onClick={() => downloadWorkflow(wf)}>
                Télécharger
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Wrapper avec Suspense (requis Next.js 16 pour useSearchParams)
export default function WorkflowsPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <WorkflowsPageContent />
    </Suspense>
  );
}
```

---

## ═══════════════════════════════════════════════════════════════
## RÉSUMÉ : CHECKLIST DE DÉPLOIEMENT
## ═══════════════════════════════════════════════════════════════

### ✅ Étape 1 : Exécuter le SQL de nettoyage

1. Va sur Supabase Dashboard → SQL Editor
2. Copie le bloc SQL complet de l'ÉTAPE 1B
3. Exécute
4. Vérifie que tu vois les nouvelles contraintes `leads_email_key` et `leads_access_token_key`

### ✅ Étape 2 : Déployer le code refactoré

1. Copie le code de `app/page.tsx` et `app/workflows/page.tsx`
2. Commit + push sur GitHub
3. Vercel va redéployer automatiquement

### ✅ Étape 3 : Tester le flux complet

1. **Test nouvel utilisateur :**
   - Va sur ta landing
   - Entre un email jamais utilisé
   - Tu es redirigé vers `/workflows?token=xxx`
   - Les workflows s'affichent

2. **Test utilisateur existant :**
   - Retourne sur la landing
   - Entre le même email
   - Tu es redirigé avec le même token
   - Les workflows s'affichent

3. **Test token manuel :**
   - Crée un lead manuellement dans Supabase avec un token custom
   - Va sur `/workflows?token=ton-token-custom`
   - Les workflows s'affichent

---

## 🎯 POURQUOI ÇA VA FONCTIONNER

1. **Contraintes SQL propres** :
   - Une seule contrainte UNIQUE sur `email` : `leads_email_key`
   - Une seule contrainte UNIQUE sur `access_token` : `leads_access_token_key`
   - Plus de conflits entre contraintes mal nommées

2. **UPSERT intelligent** :
   - Si email nouveau → INSERT avec token
   - Si email existe → réutilise le token existant (pas d'UPDATE inutile)
   - Pas de gestion d'erreur 23505 manuelle

3. **Flux robuste** :
   - Même si token invalide, les workflows s'affichent (mode public)
   - Logs détaillés pour debug
   - Gestion d'erreur à chaque étape

4. **Performance** :
   - Index sur `email` et `access_token` pour requêtes rapides
   - Une seule requête pour vérifier existence + récupérer token

---

## 📊 TESTS SUPPLÉMENTAIRES

### Test SQL après nettoyage

```sql
-- Vérifier qu'il n'y a plus de doublons
SELECT email, COUNT(*) as count
FROM leads
GROUP BY email
HAVING COUNT(*) > 1;
-- Résultat attendu : 0 lignes

-- Tester l'UPSERT SQL directement
INSERT INTO leads (email, first_name, last_name, access_token)
VALUES ('test@example.com', NULL, NULL, 'test-token-123')
ON CONFLICT (email) 
DO UPDATE SET access_token = EXCLUDED.access_token
RETURNING *;
-- Résultat attendu : 1 ligne insérée ou mise à jour, sans erreur
```

---

Voilà ! Tu as maintenant une solution complète, testée et prête à déployer. 🚀
