-- =====================================================
-- FIX : Rendre first_name et last_name NULLABLE
-- Car on ne collecte plus que l'email pour la waitlist
-- =====================================================

-- 1. Vérifier la structure actuelle de la table leads
-- =====================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;


-- 2. Rendre first_name et last_name NULLABLE (optionnels)
-- =====================================================
ALTER TABLE leads 
ALTER COLUMN first_name DROP NOT NULL;

ALTER TABLE leads 
ALTER COLUMN last_name DROP NOT NULL;


-- 3. Mettre les valeurs existantes à NULL si elles sont vides
-- =====================================================
UPDATE leads 
SET first_name = NULL 
WHERE first_name = '';

UPDATE leads 
SET last_name = NULL 
WHERE last_name = '';


-- 4. VÉRIFICATION : Afficher la nouvelle structure
-- =====================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- ✅ RÉSULTAT ATTENDU :
-- first_name  | text | YES | NULL
-- last_name   | text | YES | NULL
-- email       | text | NO  | (doit rester NOT NULL)
-- access_token| text | NO  | (doit rester NOT NULL)


-- 5. TEST : Insérer un lead sans first_name/last_name
-- =====================================================
INSERT INTO leads (email, first_name, last_name, access_token)
VALUES (
  'test-nullable@example.com',
  NULL,
  NULL,
  'test-token-nullable-' || gen_random_uuid()::text
)
ON CONFLICT (email) 
DO UPDATE SET access_token = EXCLUDED.access_token;

-- Vérifier l'insertion
SELECT * FROM leads WHERE email = 'test-nullable@example.com';

-- ✅ Si tu vois cette ligne sans erreur, c'est bon !


-- =====================================================
-- BONUS : Nettoyage optionnel (si tu veux)
-- =====================================================

-- Option A : Supprimer complètement les colonnes first_name/last_name
-- (Décommenter si tu ne veux plus du tout ces colonnes)

-- ALTER TABLE leads DROP COLUMN IF EXISTS first_name;
-- ALTER TABLE leads DROP COLUMN IF EXISTS last_name;


-- Option B : Garder les colonnes (recommandé pour l'instant)
-- Tu pourras toujours les utiliser plus tard si besoin


-- =====================================================
-- 6. Vérifier toutes les données de la table leads
-- =====================================================
SELECT 
  id,
  email,
  first_name,
  last_name,
  SUBSTRING(access_token, 1, 12) || '...' as token_preview,
  created_at
FROM leads
ORDER BY created_at DESC;


-- =====================================================
-- ✅ RÉSUMÉ DES CHANGEMENTS
-- =====================================================
-- 1. first_name et last_name sont maintenant NULLABLE
-- 2. Le code peut envoyer NULL sans erreur
-- 3. Les données existantes sont préservées
-- 4. L'email et access_token restent obligatoires (NOT NULL)
