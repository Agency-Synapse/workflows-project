-- =====================================================
-- FIX : Corriger le screenshot "Veille IA 8H"
-- Le fichier dans Storage s'appelle : veille-ia-8h.png
-- =====================================================

-- Avant : vérifier l'état actuel
SELECT 
  id,
  name,
  json_filename,
  screenshot_filename
FROM workflows
WHERE json_filename = 'Veille IA 8H.json';


-- Correction : mettre le bon nom de fichier
UPDATE workflows 
SET screenshot_filename = 'veille-ia-8h.png'
WHERE json_filename = 'Veille IA 8H.json';


-- Après : vérifier la correction
SELECT 
  id,
  name,
  json_filename,
  screenshot_filename
FROM workflows
WHERE json_filename = 'Veille IA 8H.json';


-- ✅ Maintenant rafraîchis ton site et le screenshot devrait s'afficher !


-- =====================================================
-- TEST DE L'URL (optionnel)
-- =====================================================
-- Tu peux tester cette URL dans ton navigateur :
-- https://genbzwagezbczhnfcguo.supabase.co/storage/v1/object/public/workflows-screenshots/veille-ia-8h.png
-- 
-- ✅ Si l'image s'affiche → C'est bon !
