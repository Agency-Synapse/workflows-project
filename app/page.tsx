"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { 
  Zap, 
  Clock, 
  Code2, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  AlertCircle,
  Users,
  Timer,
  TrendingUp,
  Shield
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Entre ton email pour rejoindre la waitlist 🙏");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Entre un email valide.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const token = crypto.randomUUID();

      // Insert dans saas_waitlist
      const { error: insertError } = await supabase
        .from("saas_waitlist")
        .insert({ email: cleanEmail });

      if (insertError) {
        // Si l'email existe déjà (doublon)
        if (insertError.code === "23505") {
          setError("Cet email est déjà sur la liste d'attente ! 🎉");
          return;
        }
        throw new Error(insertError.message);
      }

      // Créer également un lead dans la table leads pour l'accès aux workflows
      const { error: leadInsertError } = await supabase
        .from("leads")
        .insert({
          email: cleanEmail,
          first_name: null,
          last_name: null,
          access_token: token
        });

      // Si l'email existe déjà dans leads, on récupère son token existant
      if (leadInsertError && leadInsertError.code === "23505") {
        console.log("⚠️ Email déjà dans leads, récupération du token existant...");
        const { data: existingLead } = await supabase
          .from("leads")
          .select("access_token")
          .eq("email", cleanEmail)
          .maybeSingle();
        
        if (existingLead?.access_token) {
          console.log("✅ Token existant trouvé:", existingLead.access_token);
          setSuccess(true);
          setTimeout(() => {
            router.push(`/workflows?token=${encodeURIComponent(existingLead.access_token)}`);
          }, 2000);
          return;
        }
        
        // Si pas de token, on affiche une erreur claire
        console.error("❌ Lead existe mais sans token");
        throw new Error("Lead existant sans token. Contacte le support.");
      }
      
      // Si autre erreur lors de l'insert
      if (leadInsertError) {
        console.error("❌ Erreur insertion lead:", leadInsertError);
        throw new Error(leadInsertError.message);
      }

      console.log("✅ Inscription waitlist OK, token:", token);

      // Afficher le message de succès
      setSuccess(true);

      // Redirection vers les workflows après 2 secondes
      setTimeout(() => {
        router.push(`/workflows?token=${encodeURIComponent(token)}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription. Réessaie dans quelques secondes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <div className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true">
          <div className="absolute -top-40 left-1/4 h-[700px] w-[700px] rounded-full bg-purple-500/30 blur-3xl" />
          <div className="absolute -bottom-40 right-1/4 h-[700px] w-[700px] rounded-full bg-pink-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          
          {/* Badge "SaaS en préparation" */}
          <div className="flex justify-center">
            <div className="inline-flex animate-pulse items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-200">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-purple-500"></span>
              </span>
              🚀 SaaS en préparation · Early access only
            </div>
          </div>

          {/* HERO - Titre + Formulaire Email */}
          <div className="mt-12 text-center">
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              Arrête de galérer avec n8n.
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                L'IA fait le workflow à ta place.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-gray-300">
              Tu décris ton système en 1 prompt. Notre SaaS génère le workflow n8n, 
              l'héberge, le debug, et t'aide à corriger tes prompts.{" "}
              <span className="font-semibold text-white">
                Pendant que toi tu galères 3h sur un bug, tes concurrents automatisent déjà.
              </span>
            </p>

            {/* Formulaire Email */}
            <div className="mx-auto mt-10 max-w-xl">
              {success ? (
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-8 py-6 backdrop-blur-xl">
                  <div className="flex items-center justify-center gap-3 text-green-200">
                    <CheckCircle2 className="h-6 w-6" />
                    <p className="text-lg font-semibold">
                      C'est bon, tu es sur la liste ! 🎉
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-green-300">
                    On t'enverra les coulisses du build + l'accès en premier.
                    <br />
                    Redirection vers tes workflows...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Entre ton email pour rejoindre la waitlist"
                      disabled={isSubmitting}
                      className="w-full rounded-2xl border border-white/20 bg-white/10 px-6 py-5 text-lg text-white placeholder:text-gray-400 backdrop-blur-xl transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/30 disabled:opacity-70"
                      required
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full transform overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-8 py-5 text-xl font-bold text-white shadow-2xl shadow-purple-500/50 transition-all hover:scale-[1.02] hover:shadow-purple-500/80 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="relative flex items-center justify-center gap-3">
                      {isSubmitting ? (
                        <>
                          <Timer className="h-6 w-6 animate-spin" />
                          Inscription en cours...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-6 w-6" />
                          Réserver ma place en early access
                          <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </button>

                  <p className="text-center text-sm text-gray-400">
                    Pas de spam, juste de l'early access et des workflows gratos. 🤝
                  </p>
                </form>
              )}
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-400">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full border-2 border-gray-900 bg-gradient-to-br from-purple-400 to-pink-400"></div>
                <div className="h-8 w-8 rounded-full border-2 border-gray-900 bg-gradient-to-br from-blue-400 to-purple-400"></div>
                <div className="h-8 w-8 rounded-full border-2 border-gray-900 bg-gradient-to-br from-pink-400 to-red-400"></div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-900 bg-gray-800 text-xs font-semibold text-white">
                  +
                </div>
              </div>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Déjà +350 personnes sur la waitlist
              </span>
            </div>
          </div>

          {/* Section PROBLÈME ACTUEL */}
          <div className="mt-24">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Tu reconnais ton quotidien ? 😤
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                L'enfer de l'automatisation sans les bons outils
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Problème 1 */}
              <div className="group rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl transition hover:border-red-500/40">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                  <Clock className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="mt-4 font-bold text-white">Tu perds des heures</h3>
                <p className="mt-2 text-sm text-gray-300">
                  Héberger n8n sur Railway/Hostinger = galère technique. Tu passes plus de temps à configurer qu'à builder.
                </p>
              </div>

              {/* Problème 2 */}
              <div className="group rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl transition hover:border-red-500/40">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="mt-4 font-bold text-white">Tes workflows bug</h3>
                <p className="mt-2 text-sm text-gray-300">
                  Une erreur dans un node, tout s'arrête. Tu passes tes nuits à debugger au lieu de dormir.
                </p>
              </div>

              {/* Problème 3 */}
              <div className="group rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl transition hover:border-red-500/40">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                  <Code2 className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="mt-4 font-bold text-white">Le code te bloque</h3>
                <p className="mt-2 text-sm text-gray-300">
                  Dès que ça devient complexe, tu dois coder. ChatGPT te donne des prompts pourris qui marchent jamais.
                </p>
              </div>

              {/* Problème 4 */}
              <div className="group rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl transition hover:border-red-500/40">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                  <Users className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="mt-4 font-bold text-white">Tes clients attendent</h3>
                <p className="mt-2 text-sm text-gray-300">
                  Pendant que tu debug, tes clients s'impatientent. Tu perds des contrats parce que tu livres trop lentement.
                </p>
              </div>
            </div>
          </div>

          {/* Section AVANT / APRÈS */}
          <div className="mt-24">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ta vie avec notre SaaS 🚀
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                Voilà ce qui change quand tu arrêtes de galérer
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* AVANT */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Avant (l'enfer)</h3>
                </div>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400">•</span>
                    <span>3h pour héberger n8n + problèmes de ports/certificats</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400">•</span>
                    <span>Créer un workflow = copier-coller des tutos YouTube obsolètes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400">•</span>
                    <span>Debug manuel de chaque node qui plante</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400">•</span>
                    <span>Prompts ChatGPT qui ne fonctionnent jamais du premier coup</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400">•</span>
                    <span>Tu factures 500€ mais tu passes 20h sur le projet = 25€/h</span>
                  </li>
                </ul>
              </div>

              {/* APRÈS */}
              <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-8 backdrop-blur-xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Avec notre SaaS (le rêve)</h3>
                </div>
                <ul className="space-y-4 text-gray-200">
                  <li className="flex items-start gap-3">
                    <span className="text-green-400">✓</span>
                    <span>Instance n8n hébergée en 1 clic, 0 config technique</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400">✓</span>
                    <span>Tu décris ton système, l'IA génère le workflow complet</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400">✓</span>
                    <span>Debug automatique : l'IA détecte et corrige les erreurs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400">✓</span>
                    <span>Assistant IA qui optimise tes prompts pour que ça marche</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400">✓</span>
                    <span>Tu facturestu factures 500€ mais tu livres en 2h = 250€/h</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section POURQUOI MAINTENANT */}
          <div className="mt-24">
            <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-8 backdrop-blur-xl sm:p-12">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-200">
                  <TrendingUp className="h-4 w-4" />
                  Places limitées
                </div>
                <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
                  Pourquoi t'inscrire maintenant ?
                </h2>
                <p className="mt-4 text-lg text-gray-300">
                  Les premiers sur la liste récupèrent le plus d'avantages
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Avantage 1 */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                    <Zap className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="mt-4 font-bold text-white">Accès prioritaire</h3>
                  <p className="mt-2 text-sm text-gray-300">
                    Tu seras dans la première cohorte à tester le SaaS. Pas de liste d'attente de 6 mois.
                  </p>
                </div>

                {/* Avantage 2 */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="mt-4 font-bold text-white">Prix early bird</h3>
                  <p className="mt-2 text-sm text-gray-300">
                    -50% sur le premier abonnement à vie. Les suivants paieront le prix normal.
                  </p>
                </div>

                {/* Avantage 3 */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                    <Bot className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="mt-4 font-bold text-white">Features en exclusivité</h3>
                  <p className="mt-2 text-sm text-gray-300">
                    Tu influences le produit. On build les features que TU demandes en priorité.
                  </p>
                </div>

                {/* Avantage 4 */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                    <Shield className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="mt-4 font-bold text-white">Onboarding 1-on-1</h3>
                  <p className="mt-2 text-sm text-gray-300">
                    Appel perso pour setup ton premier workflow. Les suivants se débrouilleront seuls.
                  </p>
                </div>

                {/* Avantage 5 */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                    <Sparkles className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="mt-4 font-bold text-white">Workflows premium offerts</h3>
                  <p className="mt-2 text-sm text-gray-300">
                    3 workflows pro déjà prêts (SEO, CRO, Lead Gen) que tu peux importer direct.
                  </p>
                </div>

                {/* Avantage 6 */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="mt-4 font-bold text-white">Communauté privée</h3>
                  <p className="mt-2 text-sm text-gray-300">
                    Accès au Discord des early adopters. Entraide, partage de workflows, tips exclusifs.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm font-semibold text-purple-300">
                  ⚠️ Places limitées à 100 personnes pour la première cohorte
                </p>
              </div>
            </div>
          </div>

          {/* Section FEATURES du SaaS */}
          <div className="mt-24">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ce que notre SaaS fait pour toi
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                Automatise ton business sans te prendre la tête
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Zap className="h-7 w-7 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Instance n8n hébergée</h3>
                    <p className="mt-2 text-gray-300">
                      On héberge ton n8n. Tu te connectes, c'est prêt. Moins cher et plus simple que Hostinger ou Railway.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Bot className="h-7 w-7 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Génération de workflows par prompt</h3>
                    <p className="mt-2 text-gray-300">
                      Tu décris ton système en français. L'IA génère le workflow n8n complet avec tous les nodes configurés.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Shield className="h-7 w-7 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Debug & correction automatique</h3>
                    <p className="mt-2 text-gray-300">
                      Un workflow plante ? L'IA détecte l'erreur, te propose un fix, et l'applique. Tu valides, c'est corrigé.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Sparkles className="h-7 w-7 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Assistant prompts IA</h3>
                    <p className="mt-2 text-gray-300">
                      Tu galères à écrire un prompt ? L'assistant te guide et optimise ta demande pour que ça marche direct.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="mt-24 text-center">
            <div className="mx-auto max-w-3xl rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-12 backdrop-blur-xl">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ne reste pas coincé pendant que les autres automatisent
              </h2>
              <p className="mt-4 text-lg text-gray-200">
                Inscris-toi maintenant. On lance dans quelques semaines et les places sont limitées.
              </p>

              {!success && (
                <form onSubmit={handleSubmit} className="mt-8">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ton@email.com"
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-lg text-white placeholder:text-gray-400 backdrop-blur-xl transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/30"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-purple-500/50 transition hover:from-purple-700 hover:to-pink-700 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Timer className="h-5 w-5 animate-spin" />
                          Inscription...
                        </>
                      ) : (
                        <>
                          Je réserve ma place
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>

                  {error && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-red-300">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                </form>
              )}

              <p className="mt-6 text-sm text-gray-400">
                🎁 Bonus : workflows gratos dès que tu t'inscris
              </p>
            </div>
          </div>

          {/* Footer simple */}
          <div className="mt-16 text-center text-sm text-gray-500">
            <p>© 2026 · Made with ❤️ pour les builders qui galèrent</p>
          </div>
        </div>
      </div>
    </main>
  );
}
