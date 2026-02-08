-- =====================================================
-- TEMPLATE : Ajouter un nouveau workflow
-- Copie ce fichier et remplis les valeurs
-- =====================================================

-- INSTRUCTIONS :
-- 1. Remplace [NOM-FICHIER] par le nom exact du fichier (ex: email-automation)
-- 2. Remplace [TITRE] par le titre à afficher (ex: Email Automation Pro)
-- 3. Remplace [DESCRIPTION] par la description courte
-- 4. Exécute ce SQL sur Supabase
-- 5. Rafraîchis ton site

INSERT INTO workflows (
  json_filename,
  screenshot_filename,
  name,
  description
)
VALUES (
  '[NOM-FICHIER].json',        -- Ex: 'email-automation.json'
  '[NOM-FICHIER].png',         -- Ex: 'email-automation.png'
  '[TITRE]',                   -- Ex: 'Email Automation Pro'
  '[DESCRIPTION]'              -- Ex: 'Automatisation d'emails avec IA'
);

-- Vérifier que l'insertion a fonctionné
SELECT 
  id,
  name,
  json_filename,
  screenshot_filename,
  description
FROM workflows
WHERE json_filename = '[NOM-FICHIER].json';

-- ✅ Si tu vois ta ligne, c'est bon !
-- Rafraîchis ton site pour voir le workflow


-- =====================================================
-- EXEMPLES POUR T'INSPIRER
-- =====================================================

-- Exemple 1 : Lead Generation LinkedIn
-- INSERT INTO workflows (json_filename, screenshot_filename, name, description)
-- VALUES (
--   'lead-gen-linkedin.json',
--   'lead-gen-linkedin.png',
--   'Lead Gen LinkedIn',
--   'Extraction et qualification automatique de leads depuis LinkedIn.'
-- );

-- Exemple 2 : Email Automation
-- INSERT INTO workflows (json_filename, screenshot_filename, name, description)
-- VALUES (
--   'email-automation-pro.json',
--   'email-automation-pro.png',
--   'Email Automation Pro',
--   'Séquences d'emails automatisées avec segmentation et personnalisation IA.'
-- );

-- Exemple 3 : Web Scraping
-- INSERT INTO workflows (json_filename, screenshot_filename, name, description)
-- VALUES (
--   'scraping-apollo.json',
--   'scraping-apollo.png',
--   'Apollo Scraper',
--   'Extraction automatique de données depuis Apollo.io avec enrichissement.'
-- );

-- Exemple 4 : Social Media
-- INSERT INTO workflows (json_filename, screenshot_filename, name, description)
-- VALUES (
--   'social-media-scheduler.json',
--   'social-media-scheduler.png',
--   'Social Media Scheduler',
--   'Planification et publication automatique sur Instagram, LinkedIn et TikTok.'
-- );


-- =====================================================
-- SI TU VEUX MODIFIER UN WORKFLOW EXISTANT
-- =====================================================

-- Modifier le titre/description
-- UPDATE workflows 
-- SET 
--   name = 'Nouveau Titre',
--   description = 'Nouvelle description'
-- WHERE json_filename = 'ton-fichier.json';

-- Modifier le screenshot
-- UPDATE workflows 
-- SET screenshot_filename = 'nouveau-screenshot.png'
-- WHERE json_filename = 'ton-fichier.json';


-- =====================================================
-- SI TU VEUX SUPPRIMER UN WORKFLOW
-- =====================================================

-- Supprimer un workflow de la liste
-- DELETE FROM workflows WHERE json_filename = 'ton-fichier.json';


-- =====================================================
-- VÉRIFIER TOUS LES WORKFLOWS
-- =====================================================

-- Lister tous les workflows
SELECT 
  id,
  name,
  json_filename,
  screenshot_filename,
  LEFT(description, 50) || '...' as description_preview,
  created_at
FROM workflows
ORDER BY created_at DESC;
