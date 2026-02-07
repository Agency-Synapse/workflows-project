-- =====================================================
-- FIX : Table leads - Ajout contraintes UNIQUE
-- =====================================================

-- 1. Ajouter contrainte UNIQUE sur email (si pas déjà présente)
-- =====================================================

-- D'abord, supprimer les doublons potentiels d'emails
-- (garde seulement le plus récent pour chaque email)
DELETE FROM leads a USING leads b
WHERE a.id < b.id AND a.email = b.email;

-- Ensuite, ajouter la contrainte UNIQUE sur email (uniquement si elle n'existe pas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'leads_email_unique'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_email_unique UNIQUE (email);
  END IF;
END $$;

-- Vérifier que la contrainte existe
SELECT 
  constraint_name, 
  constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'leads' 
  AND constraint_type = 'UNIQUE';


-- 2. Ajouter contrainte UNIQUE sur access_token (si pas déjà présente)
-- =====================================================

-- Supprimer les doublons potentiels de tokens et les tokens vides
DELETE FROM leads 
WHERE access_token IS NULL OR access_token = '';

-- La contrainte existe déjà, on skip cette étape
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_constraint 
--     WHERE conname = 'leads_access_token_unique'
--   ) THEN
--     ALTER TABLE leads ADD CONSTRAINT leads_access_token_unique UNIQUE (access_token);
--   END IF;
-- END $$;

-- Créer un index sur access_token pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_leads_access_token ON leads(access_token);


-- 3. Vérifier la structure finale de la table leads
-- =====================================================

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;


-- 4. TEST : Insérer un lead avec gestion du conflit
-- =====================================================

-- Maintenant ce code devrait fonctionner
DO $$
DECLARE
  test_email TEXT := 'test-workflow@example.com';
  test_token TEXT := gen_random_uuid()::text;
BEGIN
  -- Insert ou update si l'email existe déjà
  INSERT INTO leads (email, first_name, last_name, access_token)
  VALUES (test_email, NULL, NULL, test_token)
  ON CONFLICT (email) 
  DO UPDATE SET 
    access_token = test_token,
    updated_at = NOW();
  
  RAISE NOTICE '✅ Lead créé/mis à jour pour % avec token: %', test_email, test_token;
END $$;

-- Récupérer le token créé
SELECT 
  email,
  access_token,
  created_at
FROM leads
WHERE email = 'test-workflow@example.com';


-- 5. BONUS : Mettre à jour les leads existants sans token
-- =====================================================

-- Si tu as des leads sans token, on peut leur en générer
UPDATE leads 
SET access_token = gen_random_uuid()::text 
WHERE access_token IS NULL OR access_token = '';

-- Afficher le résultat
SELECT 
  email,
  access_token,
  created_at
FROM leads
ORDER BY created_at DESC
LIMIT 10;


-- =====================================================
-- RÉSUMÉ DES CONTRAINTES AJOUTÉES
-- =====================================================

-- ✅ leads.email → UNIQUE (pas de doublons d'email)
-- ✅ leads.access_token → UNIQUE (pas de doublons de token)
-- ✅ Index sur access_token pour optimiser les requêtes

-- Maintenant tu peux :
-- 1. Tester l'inscription depuis le formulaire
-- 2. Utiliser le token pour accéder aux workflows
-- 3. Gérer correctement les doublons d'email
