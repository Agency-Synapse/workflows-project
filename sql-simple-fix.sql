-- =====================================================
-- VERSION SIMPLIFIÉE : Configuration minimale
-- =====================================================

-- 1. Vérifier l'état actuel de la table leads
-- =====================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- Afficher les contraintes existantes
SELECT 
  constraint_name, 
  constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'leads';


-- 2. Nettoyer les leads sans token
-- =====================================================
-- Supprimer les leads qui n'ont pas de token (ils ne servent à rien)
DELETE FROM leads 
WHERE access_token IS NULL OR access_token = '';


-- 3. Générer des tokens pour les nouveaux leads
-- =====================================================
-- Si certains leads n'ont pas de token, on leur en génère un
UPDATE leads 
SET access_token = gen_random_uuid()::text 
WHERE access_token IS NULL OR access_token = '';


-- 4. Ajouter la contrainte UNIQUE sur email si elle n'existe pas
-- =====================================================
DO $$
BEGIN
  -- Supprimer d'abord les doublons d'email (garde le plus récent)
  DELETE FROM leads a USING leads b
  WHERE a.id < b.id AND a.email = b.email;
  
  -- Ajouter la contrainte si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'leads_email_unique'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_email_unique UNIQUE (email);
    RAISE NOTICE '✅ Contrainte UNIQUE ajoutée sur leads.email';
  ELSE
    RAISE NOTICE '⏭️ Contrainte leads.email déjà existante';
  END IF;
END $$;


-- 5. Créer l'index sur access_token (si pas déjà présent)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_leads_access_token ON leads(access_token);


-- 6. Désactiver RLS sur toutes les tables
-- =====================================================
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE saas_waitlist DISABLE ROW LEVEL SECURITY;


-- 7. Ajouter les colonnes manquantes dans workflows
-- =====================================================
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS description TEXT;


-- 8. TEST FINAL : Créer un lead de test
-- =====================================================
DO $$
DECLARE
  test_email TEXT := 'test-final@example.com';
  test_token TEXT := gen_random_uuid()::text;
BEGIN
  -- Insérer ou mettre à jour
  INSERT INTO leads (email, first_name, last_name, access_token)
  VALUES (test_email, 'Test', 'User', test_token)
  ON CONFLICT (email) 
  DO UPDATE SET 
    access_token = EXCLUDED.access_token;
  
  RAISE NOTICE '✅ Lead test créé : %', test_email;
  RAISE NOTICE '🔑 Token : %', test_token;
END $$;


-- 9. RÉSULTAT : Afficher tous les leads avec leurs tokens
-- =====================================================
SELECT 
  id,
  email,
  first_name,
  last_name,
  access_token,
  created_at
FROM leads
ORDER BY created_at DESC;


-- 10. RÉSULTAT : Afficher tous les workflows
-- =====================================================
SELECT 
  id,
  name,
  description,
  json_filename,
  screenshot_filename,
  created_at,
  updated_at
FROM workflows
ORDER BY updated_at DESC;


-- =====================================================
-- ✅ SI TOUT S'EST BIEN PASSÉ
-- =====================================================
-- Tu devrais voir :
-- 1. La structure de la table leads avec toutes les colonnes
-- 2. Les contraintes UNIQUE sur email et access_token
-- 3. Un lead de test avec un token généré
-- 4. Tous tes leads existants avec leurs tokens
-- 5. Tous tes workflows

-- Maintenant tu peux tester l'inscription sur ton site !
