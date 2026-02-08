-- =====================================================
-- AJOUT MANUEL : Workflow "Veille IA 8H"
-- Exécute ce SQL sur Supabase pour ajouter le workflow
-- =====================================================

-- Vérifier si le workflow existe déjà
SELECT * FROM workflows WHERE json_filename = 'Veille IA 8H.json';

-- Si AUCUN résultat ci-dessus, exécute ceci :
INSERT INTO workflows (
  json_filename,
  screenshot_filename,
  name,
  description
)
VALUES (
  'Veille IA 8H.json',
  'Veille IA 8H.png',  -- Change si ton screenshot a un nom différent
  'Veille IA - Automatisation 8H',
  'Workflow de veille technologique IA avec extraction et synthèse automatique toutes les 8 heures.'
);

-- Si le workflow existait déjà, UPDATE plutôt :
-- UPDATE workflows 
-- SET 
--   screenshot_filename = 'Veille IA 8H.png',
--   name = 'Veille IA - Automatisation 8H',
--   description = 'Workflow de veille technologique IA avec extraction et synthèse automatique toutes les 8 heures.'
-- WHERE json_filename = 'Veille IA 8H.json';

-- Vérifier l'insertion
SELECT 
  id,
  name,
  description,
  json_filename,
  screenshot_filename
FROM workflows
WHERE json_filename = 'Veille IA 8H.json';

-- ✅ Tu devrais voir ton workflow !
