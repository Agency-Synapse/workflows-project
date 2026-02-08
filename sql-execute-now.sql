-- =====================================================
-- SQL À EXÉCUTER MAINTENANT SUR SUPABASE
-- Copie tout ce fichier et colle dans SQL Editor
-- =====================================================

-- 1. Supprimer TOUTES les contraintes UNIQUE (sauf primary key)
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
    RAISE NOTICE 'Contrainte supprimée : %', constraint_record.conname;
  END LOOP;
END $$;


-- 2. Nettoyer les doublons d'email (garde le plus récent par id)
-- =====================================================
DELETE FROM leads a USING leads b
WHERE a.id < b.id AND a.email = b.email;


-- 3. Supprimer les lignes sans email ou token
-- =====================================================
DELETE FROM leads 
WHERE email IS NULL 
   OR email = ''
   OR access_token IS NULL 
   OR access_token = '';


-- 4. Recréer les contraintes proprement
-- =====================================================
ALTER TABLE leads 
ADD CONSTRAINT leads_email_key UNIQUE (email);

ALTER TABLE leads 
ADD CONSTRAINT leads_access_token_key UNIQUE (access_token);


-- 5. Créer les index pour performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_access_token ON leads(access_token);


-- 6. Désactiver RLS (pour éviter problèmes d'accès)
-- =====================================================
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE saas_waitlist DISABLE ROW LEVEL SECURITY;


-- 7. Ajouter les colonnes name/description dans workflows si manquantes
-- =====================================================
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS description TEXT;


-- 8. CRÉER UN LEAD DE TEST
-- =====================================================
INSERT INTO leads (email, first_name, last_name, access_token)
VALUES (
  'test@example.com',
  'Test',
  'User',
  'test-token-123456'
)
ON CONFLICT (email) 
DO UPDATE SET access_token = 'test-token-123456';


-- 9. VÉRIFICATION : Afficher les contraintes créées
-- =====================================================
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'leads'::regclass
  AND contype = 'u'
ORDER BY conname;


-- 10. VÉRIFICATION : Afficher le lead de test
-- =====================================================
SELECT 
  email,
  access_token,
  created_at
FROM leads
WHERE email = 'test@example.com';


-- =====================================================
-- ✅ SI TU VOIS CECI SANS ERREUR :
-- =====================================================
-- 1. leads_email_key UNIQUE (email)
-- 2. leads_access_token_key UNIQUE (access_token)
-- 3. Un lead test@example.com avec token test-token-123456
--
-- → Alors ton code UPSERT va ENFIN fonctionner !
-- =====================================================
