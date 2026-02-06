"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type Lead = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

type Workflow = {
  id: string;
  name: string;
  description: string | null;
  json_filename: string;
  screenshot_filename: string | null;
  updated_at: string | null;
};

// URL de base Supabase (hardcodée car process.env ne fonctionne pas côté client)
const SUPABASE_URL = "https://genbzwagezbczhnfcguo.supabase.co";

function WorkflowsPageContent() {
  const searchParams = useSearchParams();

  const token = useMemo(() => {
    const t = searchParams.get("token");
    return t ? t.trim() : "";
  }, [searchParams]);

  const [lead, setLead] = useState<Lead | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setLead(null);
      setWorkflows([]);

      if (!token) {
        setError("Token manquant. Revenez à la page d'accueil pour obtenir un accès.");
        setIsLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseClient();

        console.log("🔍 Recherche lead avec token:", token);

        const { data: leadRow, error: leadError } = await supabase
          .from("leads")
          .select("id, first_name, last_name, email, access_token")
          .eq("access_token", token)
          .maybeSingle();

        console.log("📊 Résultat recherche lead:", { leadRow, leadError });

        if (leadError) throw new Error(leadError.message);
        if (!leadRow) {
          throw new Error(
            "Token invalide ou expiré. Merci de repasser par le formulaire."
          );
        }

        if (cancelled) return;
        setLead(leadRow as Lead);

        // Sélectionner json_filename et screenshot_filename au lieu de file_path
        const { data: workflowRows, error: workflowsError } = await supabase
          .from("workflows")
          .select("id, name, description, json_filename, screenshot_filename, updated_at")
          .order("updated_at", { ascending: false });

        console.log("📦 Workflows chargés:", workflowRows);

        if (workflowsError) throw new Error(workflowsError.message);
        if (cancelled) return;
        setWorkflows((workflowRows || []) as Workflow[]);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Erreur inconnue.");
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Fonction de téléchargement corrigée qui FORCE le téléchargement (pas d'ouverture dans le navigateur)
  async function downloadWorkflow(wf: Workflow) {
    setError(null);
    setDownloadingId(wf.id);

    try {
      // Construction de l'URL publique Supabase Storage
      const url = `${SUPABASE_URL}/storage/v1/object/public/workflows-json/${wf.json_filename}`;
      
      console.log("📥 Téléchargement workflow:", {
        name: wf.name,
        filename: wf.json_filename,
        url: url
      });

      // Fetch le fichier pour le récupérer en blob (force le téléchargement)
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: Fichier introuvable`);
      }

      const blob = await response.blob();
      
      // Création d'un lien temporaire pour télécharger le blob
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = wf.json_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL blob après un court délai
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      console.log("✅ Téléchargement terminé");
    } catch (err) {
      console.error("❌ Erreur téléchargement:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Fichier en cours d'upload, réessaye dans 1 min"
      );
    } finally {
      setDownloadingId(null);
    }
  }

  // Fonction de debug qui affiche l'URL dans la console
  function debugUrl(wf: Workflow) {
    const url = `${SUPABASE_URL}/storage/v1/object/public/workflows-json/${wf.json_filename}`;
    console.log("🔗 URL du fichier:", url);
    alert(`URL copiée dans la console:\n${url}`);
  }

  // Fonction pour gérer les erreurs d'image
  function handleImageError(workflowId: string) {
    setImageErrors(prev => new Set(prev).add(workflowId));
  }

  // Fonction pour construire l'URL du screenshot
  function getScreenshotUrl(wf: Workflow): string | null {
    if (!wf.screenshot_filename) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/workflows-screenshots/${wf.screenshot_filename}`;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true">
          <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-purple-500/30 blur-3xl" />
          <div className="absolute -bottom-40 right-1/4 h-[600px] w-[600px] rounded-full bg-pink-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                Bibliothèque de workflows
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Vos workflows, prêts à télécharger
              </h1>
              <p className="mt-2 text-sm text-gray-300">
                {lead ? (
                  <>
                    Connecté en tant que{" "}
                    <span className="font-medium text-white">
                      {lead.email || "utilisateur"}
                    </span>
                    .
                  </>
                ) : (
                  <>Accès par token.</>
                )}
              </p>
            </div>

            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              ← Revenir au formulaire
            </Link>
          </div>

          <div className="mt-8">
            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                  />
                ))}
              </div>
            ) : workflows.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center">
                <div className="text-base font-semibold text-white">
                  Aucun workflow disponible
                </div>
                <div className="mt-2 text-sm text-gray-300">
                  Vérifiez que la table <code className="text-gray-100">workflows</code>{" "}
                  contient des lignes avec les colonnes{" "}
                  <code className="text-gray-100">json_filename</code> et{" "}
                  <code className="text-gray-100">screenshot_filename</code>.
                </div>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {workflows.map((wf) => {
                  const screenshotUrl = getScreenshotUrl(wf);
                  const hasImageError = imageErrors.has(wf.id);

                  return (
                    <div
                      key={wf.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl transition hover:border-purple-500/50 hover:shadow-purple-500/20"
                    >
                      {/* Screenshot ou fallback */}
                      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600">
                        {screenshotUrl && !hasImageError ? (
                          <img
                            src={screenshotUrl}
                            alt={wf.name}
                            className="h-full w-full object-cover"
                            onError={() => handleImageError(wf.id)}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-6xl">🤖</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>

                      {/* Contenu */}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-bold text-white">
                            {wf.name}
                          </h3>
                          <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-medium text-gray-200">
                            JSON
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-300">
                          {wf.description || "Workflow n8n prêt à importer"}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-gray-400">
                          <span>
                            {wf.updated_at
                              ? new Date(wf.updated_at).toLocaleDateString("fr-FR", {
                                  year: "numeric",
                                  month: "short",
                                  day: "2-digit"
                                })
                              : "—"}
                          </span>
                        </div>

                        {/* Boutons d'action */}
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => downloadWorkflow(wf)}
                            disabled={downloadingId === wf.id}
                            className="flex-1 transform rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/50 transition-all hover:scale-[1.02] hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/80 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {downloadingId === wf.id ? "⏳ Download…" : "⬇️ Download"}
                          </button>

                          <button
                            type="button"
                            onClick={() => debugUrl(wf)}
                            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
                            title="Afficher l'URL dans la console"
                          >
                            🔗
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer avec infos debug */}
          {workflows.length > 0 && (
            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-gray-400">
              <p className="font-medium text-gray-300">💡 Debug info:</p>
              <p className="mt-1">
                • Clique sur le bouton 🔗 pour voir l'URL du fichier dans la console
              </p>
              <p className="mt-1">
                • Les fichiers doivent être dans le bucket{" "}
                <code className="text-gray-200">workflows-json</code> (public)
              </p>
              <p className="mt-1">
                • Les screenshots doivent être dans{" "}
                <code className="text-gray-200">workflows-screenshots</code> (public)
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Wrapper avec Suspense pour Next.js 16
export default function WorkflowsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4 text-white">Chargement...</p>
            </div>
          </div>
        </main>
      }
    >
      <WorkflowsPageContent />
    </Suspense>
  );
}
