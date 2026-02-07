-- =====================================================
-- DEBUG : Problème de token sur la page /workflows
-- =====================================================

-- 1. VÉRIFIER LA STRUCTURE DE LA TABLE LEADS
-- =====================================================

-- Afficher toutes les colonnes de la table leads
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- ❓ RÉSULTAT ATTENDU :
-- Tu dois voir une colonne "access_token" de type TEXT
-- Si elle n'apparaît pas, exécute la requête suivante :

ALTER TABLE leads ADD COLUMN IF NOT EXISTS access_token TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_leads_access_token ON leads(access_token);


-- 2. VÉRIFIER LES DONNÉES DANS LA TABLE LEADS
-- =====================================================

-- Afficher tous les leads avec leur token
SELECT 
  id,
  email,
  first_name,
  last_name,
  access_token,
  created_at
FROM leads
ORDER BY created_at DESC
LIMIT 10;

-- ❓ VÉRIFICATIONS :
-- 1. Y a-t-il des lignes dans la table ?
-- 2. Est-ce que la colonne access_token contient des valeurs ou NULL ?
-- 3. Est-ce que ton email récent apparaît ?


-- 3. NETTOYER LES DOUBLONS ET LEADS SANS TOKEN
-- =====================================================

-- Afficher les leads sans token (ceux qui posent problème)
SELECT 
  id,
  email,
  first_name,
  last_name,
  access_token,
  created_at
FROM leads
WHERE access_token IS NULL OR access_token = '';

-- Si tu veux supprimer les leads sans token (ATTENTION : action irréversible)
-- DELETE FROM leads WHERE access_token IS NULL OR access_token = '';


-- 4. CRÉER UN LEAD DE TEST AVEC TOKEN MANUEL
-- =====================================================

-- Insère un lead de test avec un token fixe pour vérifier que tout fonctionne
INSERT INTO leads (email, first_name, last_name, access_token)
VALUES (
  'test@example.com',
  'Test',
  'User',
  'test-token-12345'
);

-- Puis teste avec cette URL :
-- https://ton-site.vercel.app/workflows?token=test-token-12345

-- ❓ Si ça fonctionne avec ce token, le problème vient de l'insertion depuis le formulaire.


-- 5. VÉRIFIER LES WORKFLOWS DANS LA BASE
-- =====================================================

-- Afficher tous les workflows
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

-- ❓ VÉRIFICATIONS :
-- 1. Y a-t-il au moins 1 workflow ?
-- 2. Les colonnes json_filename et screenshot_filename sont-elles remplies ?


-- 6. TEST COMPLET : SIMULER L'INSCRIPTION DEPUIS LE FORMULAIRE
-- =====================================================

-- Simule l'insertion d'un lead exactement comme le fait le formulaire
DO $$
DECLARE
  test_email TEXT := 'debug@test.com';
  test_token TEXT := gen_random_uuid()::text;
BEGIN
  -- 1. Insert dans saas_waitlist
  INSERT INTO saas_waitlist (email)
  VALUES (test_email)
  ON CONFLICT (email) DO NOTHING;
  
  -- 2. Insert dans leads avec token
  INSERT INTO leads (email, first_name, last_name, access_token)
  VALUES (test_email, NULL, NULL, test_token)
  ON CONFLICT (email) DO UPDATE SET access_token = test_token;
  
  RAISE NOTICE 'Token généré pour % : %', test_email, test_token;
END $$;

-- Puis récupère le token créé :
SELECT 
  email,
  access_token,
  created_at
FROM leads
WHERE email = 'debug@test.com';

-- Copie le token et teste avec :
-- https://ton-site.vercel.app/workflows?token=LE-TOKEN-ICI


-- 7. VÉRIFIER LA ROW LEVEL SECURITY (RLS)
-- =====================================================

-- La RLS peut bloquer les requêtes si elle est activée
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('leads', 'workflows', 'saas_waitlist');

-- ❓ Si rowsecurity = TRUE, désactive-la :
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE saas_waitlist DISABLE ROW LEVEL SECURITY;


-- =====================================================
-- DIAGNOSTIC RAPIDE
-- =====================================================

-- Exécute cette requête pour un diagnostic complet
SELECT 
  'leads' AS table_name,
  COUNT(*) AS total_rows,
  COUNT(access_token) AS rows_with_token,
  COUNT(*) - COUNT(access_token) AS rows_without_token
FROM leads

UNION ALL

SELECT 
  'workflows',
  COUNT(*),
  COUNT(json_filename),
  COUNT(*) - COUNT(json_filename)
FROM workflows

UNION ALL

SELECT 
  'saas_waitlist',
  COUNT(*),
  COUNT(email),
  COUNT(*) - COUNT(email)
FROM saas_waitlist;

-- ❓ RÉSULTAT ATTENDU :
-- leads : au moins 1 ligne avec token
-- workflows : au moins 3-4 lignes avec json_filename
-- saas_waitlist : au moins 1 email
