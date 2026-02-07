-- =====================================================
-- NETTOYAGE COMPLET ET REDÉMARRAGE
-- Exécute ce fichier pour repartir à zéro
-- =====================================================

-- 1. NETTOYER TOUTES LES TABLES
-- =====================================================
TRUNCATE TABLE leads CASCADE;
TRUNCATE TABLE saas_waitlist CASCADE;
-- workflows : on garde les données


-- 2. RECONFIGURER LA TABLE LEADS
-- =====================================================

-- Supprimer toutes les contraintes existantes sauf la primary key
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_email_unique;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_access_token_unique;

-- Supprimer la colonne access_token et la recréer proprement
ALTER TABLE leads DROP COLUMN IF EXISTS access_token;
ALTER TABLE leads ADD COLUMN access_token TEXT;

-- Ajouter les contraintes UNIQUE
ALTER TABLE leads ADD CONSTRAINT leads_email_unique UNIQUE (email);
ALTER TABLE leads ADD CONSTRAINT leads_access_token_unique UNIQUE (access_token);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_leads_access_token ON leads(access_token);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);


-- 3. RECONFIGURER LA TABLE WORKFLOWS
-- =====================================================
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS description TEXT;


-- 4. DÉSACTIVER RLS SUR TOUTES LES TABLES
-- =====================================================
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE saas_waitlist DISABLE ROW LEVEL SECURITY;


-- 5. CRÉER UN LEAD DE TEST
-- =====================================================
INSERT INTO leads (email, first_name, last_name, access_token)
VALUES (
  'test@example.com',
  'Test',
  'User',
  'test-token-123456'
);


-- 6. VÉRIFIER LA CONFIGURATION
-- =====================================================

-- Afficher la structure de leads
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- Afficher les contraintes
SELECT 
  constraint_name, 
  constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'leads';

-- Afficher le lead de test
SELECT * FROM leads WHERE email = 'test@example.com';

-- Afficher les workflows
SELECT 
  id,
  name,
  description,
  json_filename,
  screenshot_filename
FROM workflows
ORDER BY created_at DESC;


-- =====================================================
-- ✅ RÉSULTAT ATTENDU
-- =====================================================
-- Tu devrais voir :
-- 1. La colonne access_token existe dans leads
-- 2. Les contraintes UNIQUE sur email et access_token
-- 3. Un lead de test avec token "test-token-123456"
-- 4. Tes 3-4 workflows

-- ✅ MAINTENANT TU PEUX TESTER :
-- https://ton-site.vercel.app/workflows?token=test-token-123456
