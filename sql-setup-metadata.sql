-- =====================================================
-- CONFIGURATION DES TABLES POUR WORKFLOWS + METADATA
-- =====================================================

-- 1. S'assurer que la table workflows a les colonnes name et description
-- =====================================================

-- Ajouter la colonne name si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workflows' AND column_name = 'name'
  ) THEN
    ALTER TABLE workflows ADD COLUMN name TEXT;
  END IF;
END $$;

-- Ajouter la colonne description si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workflows' AND column_name = 'description'
  ) THEN
    ALTER TABLE workflows ADD COLUMN description TEXT;
  END IF;
END $$;

-- Vérifier les colonnes de la table workflows
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'workflows' 
ORDER BY ordinal_position;


-- 2. S'assurer que la table leads a la colonne access_token
-- =====================================================

-- Ajouter la colonne access_token si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'access_token'
  ) THEN
    ALTER TABLE leads ADD COLUMN access_token TEXT UNIQUE;
  END IF;
END $$;

-- Créer un index sur access_token pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_leads_access_token ON leads(access_token);

-- Vérifier les colonnes de la table leads
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;


-- 3. Mettre à jour les workflows existants avec des métadonnées par défaut (optionnel)
-- =====================================================

-- Cette requête met à jour les workflows qui n'ont pas de name/description
-- Tu peux la commenter si tu préfères utiliser le bouton "sync" dans l'interface

-- Update search-console-reports.json
UPDATE workflows 
SET 
  name = 'Workflow SEO Pro',
  description = 'Génération automatique de rapports SEO depuis Google Search Console vers Google Sheets.'
WHERE json_filename = 'search-console-reports.json' 
  AND (name IS NULL OR name = '' OR description IS NULL OR description = '');

-- Update landing-page-cro-audit.json
UPDATE workflows 
SET 
  name = 'CRO & A/B Testing',
  description = 'Analyse automatique de landing pages avec suggestions d''optimisation CRO par IA.'
WHERE json_filename = 'landing-page-cro-audit.json' 
  AND (name IS NULL OR name = '' OR description IS NULL OR description = '');

-- Update CLAUDE.md
UPDATE workflows 
SET 
  name = 'Claude Context Remotion',
  description = 'Mon contexte Claude pour générer des vidéos Remotion automatiquement avec l''IA.'
WHERE json_filename = 'CLAUDE.md' 
  AND (name IS NULL OR name = '' OR description IS NULL OR description = '');

-- Update lead-gen.json
UPDATE workflows 
SET 
  name = 'Lead Gen LinkedIn',
  description = 'Extraction et qualification automatique de leads depuis LinkedIn.'
WHERE json_filename = 'lead-gen.json' 
  AND (name IS NULL OR name = '' OR description IS NULL OR description = '');


-- 4. Vérifier que tout est bien configuré
-- =====================================================

-- Afficher tous les workflows avec leurs métadonnées
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

-- Afficher quelques leads pour vérifier les tokens
SELECT 
  id,
  email,
  first_name,
  last_name,
  access_token,
  created_at
FROM leads
ORDER BY created_at DESC
LIMIT 5;


-- =====================================================
-- NOTES D'UTILISATION
-- =====================================================

-- Pour ajouter un nouveau workflow avec ses métadonnées :
-- 1. Upload le fichier JSON + screenshot dans Supabase Storage
-- 2. Insère une ligne dans la table workflows :

/*
INSERT INTO workflows (json_filename, screenshot_filename, name, description)
VALUES (
  'nom-fichier.json',
  'nom-screenshot.png',
  'Titre du workflow',
  'Description du workflow'
);
*/

-- Ou bien :
-- 1. Upload juste le fichier (sans métadonnées)
-- 2. Insère uniquement le json_filename
-- 3. Utilise le bouton "Mettre à jour les métadonnées" sur la page /workflows
--    → Le système va automatiquement générer name/description depuis le preset ou le nom du fichier
