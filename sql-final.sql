-- =====================================================
-- VERSION FINALE ULTRA-SIMPLIFIÉE
-- Exécute ce fichier SECTION PAR SECTION
-- =====================================================

-- SECTION 1 : Vérifier l'état actuel
-- =====================================================
SELECT 'leads' as table_name, COUNT(*) as total_rows FROM leads
UNION ALL
SELECT 'workflows', COUNT(*) FROM workflows
UNION ALL
SELECT 'saas_waitlist', COUNT(*) FROM saas_waitlist;


-- SECTION 2 : Nettoyer les leads sans token
-- =====================================================
DELETE FROM leads 
WHERE access_token IS NULL OR access_token = '';


-- SECTION 3 : Ajouter UNIQUE sur email (si pas déjà présent)
-- =====================================================
DO $$
BEGIN
  -- Supprimer les doublons d'email d'abord
  DELETE FROM leads a USING leads b
  WHERE a.id < b.id AND a.email = b.email;
  
  -- Ajouter la contrainte si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'leads_email_unique'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_email_unique UNIQUE (email);
  END IF;
END $$;


-- SECTION 4 : Index sur access_token
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_leads_access_token ON leads(access_token);


-- SECTION 5 : Désactiver RLS
-- =====================================================
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE saas_waitlist DISABLE ROW LEVEL SECURITY;


-- SECTION 6 : Colonnes name/description dans workflows
-- =====================================================
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS description TEXT;


-- SECTION 7 : Créer un lead de test
-- =====================================================
INSERT INTO leads (email, first_name, last_name, access_token)
VALUES (
  'test-final@example.com',
  'Test',
  'User',
  gen_random_uuid()::text
)
ON CONFLICT (email) 
DO UPDATE SET access_token = gen_random_uuid()::text;


-- SECTION 8 : Afficher le lead de test avec son token
-- =====================================================
SELECT 
  email,
  access_token,
  created_at
FROM leads
WHERE email = 'test-final@example.com';

-- ✅ COPIE LE TOKEN CI-DESSUS ET TESTE AVEC :
-- https://ton-site.vercel.app/workflows?token=LE-TOKEN-ICI


-- SECTION 9 : Afficher tous les leads
-- =====================================================
SELECT 
  id,
  email,
  SUBSTRING(access_token, 1, 8) || '...' as token_preview,
  created_at
FROM leads
ORDER BY created_at DESC;


-- SECTION 10 : Afficher tous les workflows
-- =====================================================
SELECT 
  id,
  name,
  description,
  json_filename,
  screenshot_filename
FROM workflows
ORDER BY created_at DESC;


-- =====================================================
-- ✅ C'EST TOUT !
-- =====================================================
-- Maintenant :
-- 1. Copie le token de test de la SECTION 8
-- 2. Teste l'URL : /workflows?token=LE-TOKEN
-- 3. Si ça marche, teste l'inscription depuis ta page d'accueil
