-- =====================================================
-- FIX : Corriger le nom du screenshot pour "Veille IA 8H"
-- =====================================================

-- 1. VÉRIFIER LE NOM ACTUEL DANS LA TABLE
-- =====================================================
SELECT 
  id,
  name,
  json_filename,
  screenshot_filename,
  description
FROM workflows
WHERE json_filename = 'Veille IA 8H.json';

-- ✅ Note le screenshot_filename actuel ci-dessus


-- 2. VÉRIFIER LES FICHIERS DISPONIBLES DANS STORAGE
-- =====================================================
-- Va sur Supabase → Storage → workflows-screenshots
-- Note le nom EXACT du fichier (avec espaces, extension, majuscules, etc.)
-- Par exemple :
--   - "Veille IA 8H.png"
--   - "veille-ia-8h.png"
--   - "Veille IA.png"
--   - "veille_ia_8h.png"


-- 3. CORRIGER LE NOM DU SCREENSHOT
-- =====================================================

-- Option A : Le fichier s'appelle "Veille IA 8H.png" (avec espaces)
UPDATE workflows 
SET screenshot_filename = 'Veille IA 8H.png'
WHERE json_filename = 'Veille IA 8H.json';

-- Option B : Le fichier s'appelle "veille-ia-8h.png" (avec tirets)
-- UPDATE workflows 
-- SET screenshot_filename = 'veille-ia-8h.png'
-- WHERE json_filename = 'Veille IA 8H.json';

-- Option C : Le fichier s'appelle "Veille_IA_8H.png" (avec underscores)
-- UPDATE workflows 
-- SET screenshot_filename = 'Veille_IA_8H.png'
-- WHERE json_filename = 'Veille IA 8H.json';

-- Option D : Pas de screenshot (mettre NULL)
-- UPDATE workflows 
-- SET screenshot_filename = NULL
-- WHERE json_filename = 'Veille IA 8H.json';


-- 4. VÉRIFIER LA CORRECTION
-- =====================================================
SELECT 
  id,
  name,
  json_filename,
  screenshot_filename
FROM workflows
WHERE json_filename = 'Veille IA 8H.json';


-- 5. TESTER L'URL DU SCREENSHOT
-- =====================================================
-- Si screenshot_filename = 'Veille IA 8H.png', l'URL sera :
-- https://genbzwagezbczhnfcguo.supabase.co/storage/v1/object/public/workflows-screenshots/Veille%20IA%208H.png
-- (les espaces sont encodés en %20)

-- Copie cette URL et teste-la dans ton navigateur :
-- ✅ Si l'image s'affiche → le nom est correct
-- ❌ Si erreur 404 → le nom ne correspond pas au fichier dans Storage


-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- 1. Va sur Supabase → Storage → workflows-screenshots
-- 2. Note le nom EXACT du fichier screenshot
-- 3. Décommente l'option correspondante ci-dessus
-- 4. Exécute l'UPDATE
-- 5. Rafraîchis ton site
-- 6. ✅ Le screenshot devrait s'afficher !
