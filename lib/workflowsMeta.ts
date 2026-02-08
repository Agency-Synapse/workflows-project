import { getSupabaseClient } from "./supabase";

// Type minimal pour les métadonnées d'un workflow
export type WorkflowMeta = {
  name: string;
  description: string;
};

// Type pour un workflow avec métadonnées optionnelles
export type WorkflowWithOptionalMeta = {
  id: string;
  json_filename: string;
  name?: string | null;
  description?: string | null;
  screenshot_filename?: string | null;
  updated_at?: string | null;
};

// Presets de métadonnées pour les workflows connus
// Pour ajouter un nouveau preset : ajoute une ligne avec le nom exact du fichier JSON
export const WORKFLOW_PRESETS: Record<string, WorkflowMeta> = {
  "search-console-reports.json": {
    name: "Workflow SEO Pro",
    description: "Génération automatique de rapports SEO depuis Google Search Console vers Google Sheets."
  },
  "landing-page-cro-audit.json": {
    name: "CRO & A/B Testing",
    description: "Analyse automatique de landing pages avec suggestions d'optimisation CRO par IA."
  },
  "CLAUDE.md": {
    name: "Claude Context Remotion",
    description: "Mon contexte Claude pour générer des vidéos Remotion automatiquement avec l'IA."
  },
  "Veille IA 8H.json": {
    name: "Veille IA - Automatisation 8H",
    description: "Workflow de veille technologique IA avec extraction et synthèse automatique toutes les 8 heures."
  },
  "lead-gen.json": {
    name: "Lead Gen LinkedIn",
    description: "Extraction et qualification automatique de leads depuis LinkedIn."
  },
  "email-automation.json": {
    name: "Email Automation Pro",
    description: "Séquences d'emails automatisées avec segmentation et personnalisation IA."
  }
};

/**
 * Génère un nom lisible à partir d'un nom de fichier
 * Ex: "lead-gen.json" → "Lead Gen"
 */
function generateNameFromFilename(filename: string): string {
  // Retirer l'extension
  const nameWithoutExt = filename.replace(/\.(json|md)$/i, "");
  
  // Split par tirets/underscores/espaces et capitaliser
  const words = nameWithoutExt
    .split(/[-_\s]+/)
    .map(word => {
      // Garder les acronymes en majuscules (ex: IA, SEO, CRO)
      if (word.length <= 3 && word === word.toUpperCase()) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
  
  return words || "Workflow n8n";
}

/**
 * Génère une description basique à partir du nom de fichier
 */
function generateDescriptionFromFilename(filename: string): string {
  const lowerFilename = filename.toLowerCase();
  
  // Détection par mots-clés
  if (lowerFilename.includes("seo")) {
    return "Workflow d'optimisation SEO et génération de contenu automatique.";
  }
  if (lowerFilename.includes("lead") || lowerFilename.includes("prospect")) {
    return "Automatisation de la prospection et qualification de leads.";
  }
  if (lowerFilename.includes("cro") || lowerFilename.includes("conversion")) {
    return "Analyse et optimisation du taux de conversion de vos pages.";
  }
  if (lowerFilename.includes("email") || lowerFilename.includes("mail")) {
    return "Automatisation d'emails et séquences de nurturing.";
  }
  if (lowerFilename.includes("scraping") || lowerFilename.includes("scrape")) {
    return "Extraction automatique de données depuis le web.";
  }
  if (lowerFilename.includes("social") || lowerFilename.includes("instagram") || lowerFilename.includes("tiktok")) {
    return "Automatisation de posts et engagement sur les réseaux sociaux.";
  }
  if (lowerFilename.includes("claude") || lowerFilename.includes("context")) {
    return "Contexte et prompts optimisés pour automatiser avec l'IA.";
  }
  if (lowerFilename.includes("veille") || lowerFilename.includes("monitoring") || lowerFilename.includes("watch")) {
    return "Système de veille automatisée avec collecte et synthèse d'informations.";
  }
  
  // Fallback générique
  return "Workflow d'automatisation n8n prêt à l'emploi.";
}

/**
 * Récupère les métadonnées d'un workflow (nom + description).
 * Utilise les presets si disponibles, sinon génère automatiquement.
 */
export function getWorkflowMetaFromFilename(jsonFilename: string): WorkflowMeta {
  // Si on a un preset, on l'utilise
  if (WORKFLOW_PRESETS[jsonFilename]) {
    return WORKFLOW_PRESETS[jsonFilename];
  }
  
  // Sinon, génération automatique
  return {
    name: generateNameFromFilename(jsonFilename),
    description: generateDescriptionFromFilename(jsonFilename)
  };
}

/**
 * Synchronise les métadonnées manquantes vers Supabase.
 * Pour chaque workflow sans name/description, calcule les valeurs et fait un UPDATE.
 */
export async function syncWorkflowsMetaToSupabase(
  workflows: WorkflowWithOptionalMeta[]
): Promise<{ success: number; errors: number }> {
  const supabase = getSupabaseClient();
  let success = 0;
  let errors = 0;

  console.log("🔄 Sync des métadonnées workflows vers Supabase...");

  for (const workflow of workflows) {
    // Si name et description existent déjà, on skip
    if (workflow.name && workflow.description) {
      console.log(`⏭️ Skip ${workflow.json_filename} (métadonnées déjà présentes)`);
      continue;
    }

    // Générer les métadonnées
    const meta = getWorkflowMetaFromFilename(workflow.json_filename);

    try {
      const { error } = await supabase
        .from("workflows")
        .update({
          name: workflow.name || meta.name,
          description: workflow.description || meta.description
        })
        .eq("id", workflow.id);

      if (error) {
        console.error(`❌ Erreur sync ${workflow.json_filename}:`, error.message);
        errors++;
      } else {
        console.log(`✅ Sync OK: ${meta.name}`);
        success++;
      }
    } catch (err) {
      console.error(`❌ Exception sync ${workflow.json_filename}:`, err);
      errors++;
    }
  }

  console.log(`📊 Sync terminé: ${success} succès, ${errors} erreurs`);
  return { success, errors };
}
