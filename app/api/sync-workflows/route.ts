import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { getWorkflowMetaFromFilename } from "@/lib/workflowsMeta";

export async function POST() {
  try {
    const supabase = getSupabaseClient();

    console.log("🔄 Début de la synchronisation des workflows...");

    // 1. Lister tous les fichiers JSON dans le bucket
    const { data: jsonFiles, error: listError } = await supabase.storage
      .from("workflows-json")
      .list("", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (listError) {
      console.error("❌ Erreur listing bucket:", listError);
      throw new Error(`Erreur listing bucket: ${listError.message}`);
    }

    console.log("📦 Fichiers bruts du bucket:", jsonFiles);

    // Filtrer uniquement les fichiers JSON/MD (ignorer dossiers et placeholders)
    const validFiles = (jsonFiles || []).filter((file) => {
      return (
        file.name &&
        file.name !== ".emptyFolderPlaceholder" &&
        /\.(json|md)$/i.test(file.name)
      );
    });

    if (validFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucun fichier JSON/MD valide trouvé dans le bucket",
        added: 0,
        skipped: 0,
        debug: {
          totalFiles: jsonFiles?.length || 0,
          validFiles: 0,
        },
      });
    }

    console.log(`📦 ${validFiles.length} fichiers valides trouvés:`, validFiles.map(f => f.name));

    // 2. Récupérer tous les workflows existants dans la table
    const { data: existingWorkflows, error: selectError } = await supabase
      .from("workflows")
      .select("json_filename");

    if (selectError) {
      console.error("❌ Erreur récupération workflows:", selectError);
      throw new Error(`Erreur récupération workflows: ${selectError.message}`);
    }

    const existingFilenames = new Set(
      (existingWorkflows || []).map((wf) => wf.json_filename)
    );

    console.log(`📊 ${existingFilenames.size} workflows déjà dans la table`);

    // 3. Lister les screenshots disponibles
    const { data: screenshotFiles } = await supabase.storage
      .from("workflows-screenshots")
      .list("", {
        limit: 100,
        offset: 0,
      });

    const screenshotMap = new Map();
    if (screenshotFiles) {
      screenshotFiles.forEach((file) => {
        // Associer les screenshots par nom de base
        // Ex: "search-console.png" → "search-console"
        const baseName = file.name.replace(/\.(png|jpg|jpeg|webp)$/i, "");
        screenshotMap.set(baseName, file.name);
      });
    }

    // 4. Préparer les nouveaux workflows à insérer
    const newWorkflows = [];
    let skipped = 0;

    for (const file of validFiles) {

      // Vérifier si ce workflow existe déjà
      if (existingFilenames.has(file.name)) {
        console.log(`⏭️  Skip (existe déjà): ${file.name}`);
        skipped++;
        continue;
      }

      // Générer les métadonnées à partir du nom de fichier
      const meta = getWorkflowMetaFromFilename(file.name);

      // Trouver le screenshot correspondant
      const baseName = file.name.replace(/\.(json|md)$/i, "");
      const screenshotFilename = screenshotMap.get(baseName) || null;

      if (!screenshotFilename) {
        console.warn(`⚠️  Pas de screenshot trouvé pour: ${file.name}`);
      }

      newWorkflows.push({
        json_filename: file.name,
        screenshot_filename: screenshotFilename,
        name: meta.name,
        description: meta.description,
      });

      console.log(`✅ Nouveau workflow: ${meta.name} (${file.name})`);
    }

    // 5. Insérer les nouveaux workflows dans la table
    if (newWorkflows.length > 0) {
      const { error: insertError } = await supabase
        .from("workflows")
        .insert(newWorkflows);

      if (insertError) {
        console.error("❌ Erreur insertion workflows:", insertError);
        throw new Error(`Erreur insertion: ${insertError.message}`);
      }

      console.log(`✅ ${newWorkflows.length} nouveaux workflows ajoutés`);
    } else {
      console.log("📭 Aucun nouveau workflow à ajouter");
    }

    // 6. Retourner le résultat
    return NextResponse.json({
      success: true,
      message: `Synchronisation terminée : ${newWorkflows.length} ajoutés, ${skipped} ignorés`,
      added: newWorkflows.length,
      skipped: skipped,
      workflows: newWorkflows.map((wf) => ({
        name: wf.name,
        filename: wf.json_filename,
      })),
    });
  } catch (error) {
    console.error("❌ Erreur synchronisation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
