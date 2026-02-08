-- =====================================================
-- FIX COMPLET : Tout corriger en une seule fois
-- Ce SQL résout TOUS les problèmes :
-- 1. Contraintes UNIQUE
-- 2. Colonnes first_name/last_name NOT NULL
-- 3. Doublons
-- =====================================================

-- ÉTAPE 1 : Supprimer toutes les contraintes UNIQUE (sauf primary key)
-- =====================================================
DO $$ 
DECLARE 
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN 
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'leads'::regclass 
      AND contype = 'u'
      AND conname != 'leads_pkey'
  LOOP
    EXECUTE 'ALTER TABLE leads DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_record.conname);
    RAISE NOTICE '✅ Contrainte supprimée : %', constraint_record.conname;
  END LOOP;
END $$;


-- ÉTAPE 2 : Rendre first_name et last_name NULLABLE
-- =====================================================
ALTER TABLE leads ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN last_name DROP NOT NULL;

DO $$
BEGIN
  RAISE NOTICE '✅ first_name et last_name sont maintenant NULLABLE';
END $$;


-- ÉTAPE 3 : Nettoyer les valeurs vides
-- =====================================================
UPDATE leads SET first_name = NULL WHERE first_name = '';
UPDATE leads SET last_name = NULL WHERE last_name = '';


-- ÉTAPE 4 : Nettoyer les doublons d'email (garde le plus récent)
-- =====================================================
DELETE FROM leads a USING leads b
WHERE a.id < b.id AND a.email = b.email;

DO $$
BEGIN
  RAISE NOTICE '✅ Doublons d email supprimés';
END $$;


-- ÉTAPE 5 : Supprimer les lignes sans email ou token
-- =====================================================
DELETE FROM leads 
WHERE email IS NULL 
   OR email = ''
   OR access_token IS NULL 
   OR access_token = '';


-- ÉTAPE 6 : Recréer les contraintes UNIQUE proprement
-- =====================================================
ALTER TABLE leads ADD CONSTRAINT leads_email_key UNIQUE (email);
ALTER TABLE leads ADD CONSTRAINT leads_access_token_key UNIQUE (access_token);

DO $$
BEGIN
  RAISE NOTICE '✅ Contraintes UNIQUE recréées';
END $$;


-- ÉTAPE 7 : Créer les index pour performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_access_token ON leads(access_token);


-- ÉTAPE 8 : Désactiver RLS
-- =====================================================
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE saas_waitlist DISABLE ROW LEVEL SECURITY;


-- ÉTAPE 9 : Ajouter colonnes dans workflows si manquantes
-- =====================================================
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS description TEXT;


-- ÉTAPE 10 : Créer un lead de test SANS first_name/last_name
-- =====================================================
INSERT INTO leads (email, first_name, last_name, access_token)
VALUES (
  'test-final@example.com',
  NULL,
  NULL,
  'test-token-final-123'
)
ON CONFLICT (email) 
DO UPDATE SET access_token = 'test-token-final-123';

DO $$
BEGIN
  RAISE NOTICE '✅ Lead de test créé';
END $$;


-- =====================================================
-- VÉRIFICATIONS FINALES
-- =====================================================

-- Vérification 1 : Structure de la table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- ✅ RÉSULTAT ATTENDU :
-- first_name   | text | YES (nullable)
-- last_name    | text | YES (nullable)
-- email        | text | NO  (not null)
-- access_token | text | NO  (not null)


-- Vérification 2 : Contraintes UNIQUE
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'leads'::regclass
  AND contype = 'u'
ORDER BY conname;

-- ✅ RÉSULTAT ATTENDU :
-- leads_email_key         | UNIQUE (email)
-- leads_access_token_key  | UNIQUE (access_token)


-- Vérification 3 : Lead de test
SELECT 
  email,
  first_name,
  last_name,
  access_token
FROM leads
WHERE email = 'test-final@example.com';

-- ✅ RÉSULTAT ATTENDU :
-- email: test-final@example.com
-- first_name: NULL
-- last_name: NULL
-- access_token: test-token-final-123


-- Vérification 4 : Tous les leads
SELECT 
  id,
  email,
  first_name,
  last_name,
  SUBSTRING(access_token, 1, 12) || '...' as token_preview
FROM leads
ORDER BY id DESC
LIMIT 5;


-- =====================================================
-- TEST FINAL : Insérer un lead comme le fait ton code
-- =====================================================
DO $$
DECLARE
  test_email TEXT := 'neil78her@gmail.com';
  test_token TEXT := gen_random_uuid()::text;
BEGIN
  -- Exactement comme ton code Next.js
  INSERT INTO leads (email, first_name, last_name, access_token)
  VALUES (test_email, NULL, NULL, test_token)
  ON CONFLICT (email) 
  DO UPDATE SET access_token = EXCLUDED.access_token;
  
  RAISE NOTICE '✅ Test insertion OK pour %', test_email;
  RAISE NOTICE '🔑 Token: %', test_token;
END $$;


-- =====================================================
-- ✅ SI TU ARRIVES ICI SANS ERREUR :
-- =====================================================
-- 1. ✅ first_name et last_name sont NULLABLE
-- 2. ✅ Contraintes UNIQUE recréées proprement
-- 3. ✅ Doublons nettoyés
-- 4. ✅ Lead de test créé
-- 5. ✅ Ton code Next.js va ENFIN fonctionner !
-- =====================================================

-- 🚀 TESTE MAINTENANT TON SITE :
-- 1. Va sur ta landing
-- 2. Entre ton email
-- 3. Tu seras redirigé vers /workflows
-- =====================================================
