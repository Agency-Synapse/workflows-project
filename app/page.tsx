"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

// Type pour les données du formulaire de qualification lead
type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  statut: string;
  objectif: string;
  ca_mensuel: string;
  interesse_saas: string;
};

export default function HomePage() {
  const router = useRouter();

  // État du formulaire avec tous les champs de qualification
  const [form, setForm] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    statut: "",
    objectif: "",
    ca_mensuel: "",
    interesse_saas: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation email
  const isValidEmail = useMemo(() => {
    const v = form.email.trim();
    if (!v) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [form.email]);

  // Gestion de la soumission du formulaire
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Nettoyage et validation des champs
    const first_name = form.first_name.trim();
    const last_name = form.last_name.trim();
    const email = form.email.trim().toLowerCase();
    const statut = form.statut;
    const objectif = form.objectif;
    const ca_mensuel = form.ca_mensuel;
    const interesse_saas = form.interesse_saas;

    // Vérification que tous les champs sont remplis
    if (!first_name || !last_name || !email || !statut || !objectif || !ca_mensuel || !interesse_saas) {
      setError("Merci de remplir tous les champs pour accéder aux workflows 🙏");
      return;
    }

    if (!isValidEmail) {
      setError("Merci de saisir un email valide.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const token = crypto.randomUUID();

      console.log("🔑 Token généré:", token);

      // Insert dans Supabase avec tous les champs + token
      const { data, error: insertError } = await supabase
        .from("leads")
        .insert({
          first_name,
          last_name,
          email,
          statut,
          objectif,
          ca_mensuel,
          interesse_saas,
          access_token: token
        })
        .select();

      console.log("📝 Résultat insertion:", { data, error: insertError });

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Log spécial si le lead est très intéressé par le SaaS (early access)
      if (interesse_saas === "Oui, carrément ! Préviens-moi en premier 🔥") {
        console.log("🔥 EARLY ACCESS LEAD:", { email, statut, ca_mensuel });
      }

      console.log("✅ Insertion OK, redirection vers /workflows");

      // Redirection vers la page workflows avec le token
      router.push(`/workflows?token=${encodeURIComponent(token)}`);
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
          <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-purple-500/30 blur-3xl" />
          <div className="absolute -bottom-40 right-1/4 h-[600px] w-[600px] rounded-full bg-pink-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Layout 2 colonnes : Value Prop (gauche) + Formulaire (droite) */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            
            {/* COLONNE GAUCHE - Value Proposition + Tease SaaS */}
            <div className="flex flex-col justify-center lg:col-span-2">
              
              {/* Badge animé */}
              <div className="inline-flex w-fit animate-pulse items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-200">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-purple-500"></span>
                </span>
                ✨ Workflows gratuits + Accès early au SaaS
              </div>

              {/* Titre principal */}
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Workflows n8n pro + Accès early au SaaS d'automation 🚀
              </h1>

              {/* Sous-titre */}
              <p className="mt-4 text-lg leading-relaxed text-gray-300">
                Télécharge les workflows pro que j'utilise + découvre le SaaS qu'on prépare pour révolutionner l'automatisation.
              </p>

              {/* Ce que tu récupères gratuitement */}
              <div className="mt-8 space-y-3">
                <p className="text-base font-semibold text-white">🎁 Ce que tu récupères gratuitement :</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2 transition hover:translate-x-1">
                    <span className="text-purple-400">⚡</span>
                    <span>3 workflows n8n pro (SEO, CRO, Lead Gen)</span>
                  </li>
                  <li className="flex items-start gap-2 transition hover:translate-x-1">
                    <span className="text-purple-400">🎥</span>
                    <span>Mon contexte Claude pour Remotion</span>
                  </li>
                  <li className="flex items-start gap-2 transition hover:translate-x-1">
                    <span className="text-purple-400">🔥</span>
                    <span>Setup en 15 min, même sans coder</span>
                  </li>
                </ul>
              </div>

              {/* Séparateur */}
              <div className="my-8 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

              {/* Section SaaS en préparation */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-base font-semibold text-white">🚀 En préparation : Notre SaaS</p>
                  <span className="animate-pulse rounded-full bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-300">
                    Coming Soon
                  </span>
                </div>

                <p className="text-sm text-gray-300">On construit un truc de fou...</p>

                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start gap-3 transition hover:translate-x-1">
                    <span className="text-xl">☁️</span>
                    <span>Instance n8n hébergée (moins cher que Hostinger)</span>
                  </li>
                  <li className="flex items-start gap-3 transition hover:translate-x-1">
                    <span className="text-xl hover:rotate-12">🤖</span>
                    <span>Génère tes workflows juste avec un prompt</span>
                  </li>
                  <li className="flex items-start gap-3 transition hover:translate-x-1">
                    <span className="text-xl">🛠️</span>
                    <span>Debug & correction auto de tes workflows</span>
                  </li>
                  <li className="flex items-start gap-3 transition hover:translate-x-1">
                    <span className="text-xl">💬</span>
                    <span>Assistant IA pour optimiser tes prompts</span>
                  </li>
                </ul>

                <p className="mt-4 text-sm text-purple-300">
                  👉 Dis-nous si ça t'intéresse dans le formulaire
                </p>
              </div>

              {/* Social proof */}
              <div className="mt-8 flex items-center gap-2 text-sm text-gray-400">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-gray-900 bg-gradient-to-br from-purple-400 to-pink-400"></div>
                  <div className="h-8 w-8 rounded-full border-2 border-gray-900 bg-gradient-to-br from-blue-400 to-purple-400"></div>
                  <div className="h-8 w-8 rounded-full border-2 border-gray-900 bg-gradient-to-br from-pink-400 to-red-400"></div>
                </div>
                <span>+300 personnes attendent déjà l'accès</span>
              </div>
            </div>

            {/* COLONNE DROITE - Formulaire */}
            <div className="flex items-center lg:col-span-3">
              <div className="w-full rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
                
                {/* Header formulaire */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-200">
                    Gratuit · 2 min
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-white">
                    Récupère tout + rejoins l'early access 🎁
                  </h2>
                  <p className="mt-2 text-sm text-gray-300">
                    Remplis ça et accède aux workflows maintenant
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Prénom + Nom */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="first_name" className="mb-2 block text-sm font-medium text-gray-200">
                        Prénom
                      </label>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        autoComplete="given-name"
                        value={form.first_name}
                        onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        placeholder="Alex"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="mb-2 block text-sm font-medium text-gray-200">
                        Nom
                      </label>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        autoComplete="family-name"
                        value={form.last_name}
                        onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        placeholder="Martin"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-200">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="alex@gmail.com"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Statut n8n */}
                  <div>
                    <label htmlFor="statut" className="mb-2 block text-sm font-medium text-gray-200">
                      Où en es-tu avec n8n / l'automatisation ?
                    </label>
                    <select
                      id="statut"
                      name="statut"
                      value={form.statut}
                      onChange={(e) => setForm((p) => ({ ...p, statut: e.target.value }))}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      disabled={isSubmitting}
                      required
                    >
                      <option value="" disabled className="bg-gray-900">Choisis ton niveau...</option>
                      <option value="🚀 Jamais touché n8n, je découvre" className="bg-gray-900">🚀 Jamais touché n8n, je découvre</option>
                      <option value="👨‍💻 J'ai fait quelques workflows basiques" className="bg-gray-900">👨‍💻 J'ai fait quelques workflows basiques</option>
                      <option value="⚙️ J'utilise n8n régulièrement (agence/perso)" className="bg-gray-900">⚙️ J'utilise n8n régulièrement (agence/perso)</option>
                      <option value="🏢 J'ai une agence automation qui tourne" className="bg-gray-900">🏢 J'ai une agence automation qui tourne</option>
                    </select>
                  </div>

                  {/* Objectif / Problème */}
                  <div>
                    <label htmlFor="objectif" className="mb-2 block text-sm font-medium text-gray-200">
                      C'est quoi ton plus gros problème avec n8n actuellement ?
                    </label>
                    <select
                      id="objectif"
                      name="objectif"
                      value={form.objectif}
                      onChange={(e) => setForm((p) => ({ ...p, objectif: e.target.value }))}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      disabled={isSubmitting}
                      required
                    >
                      <option value="" disabled className="bg-gray-900">Choisis ce qui te bloque...</option>
                      <option value="Je ne sais pas comment héberger n8n (c'est compliqué)" className="bg-gray-900">Je ne sais pas comment héberger n8n (c'est compliqué)</option>
                      <option value="Mes workflows bug tout le temps, je perds du temps" className="bg-gray-900">Mes workflows bug tout le temps, je perds du temps</option>
                      <option value="Je dois coder des trucs complexes, ça prend des heures" className="bg-gray-900">Je dois coder des trucs complexes, ça prend des heures</option>
                      <option value="Je galère à trouver les bons prompts pour l'IA" className="bg-gray-900">Je galère à trouver les bons prompts pour l'IA</option>
                      <option value="Je n'ai pas encore commencé mais ça m'intéresse" className="bg-gray-900">Je n'ai pas encore commencé mais ça m'intéresse</option>
                    </select>
                  </div>

                  {/* CA mensuel */}
                  <div>
                    <label htmlFor="ca_mensuel" className="mb-2 block text-sm font-medium text-gray-200">
                      Ton CA mensuel actuel ?
                    </label>
                    <select
                      id="ca_mensuel"
                      name="ca_mensuel"
                      value={form.ca_mensuel}
                      onChange={(e) => setForm((p) => ({ ...p, ca_mensuel: e.target.value }))}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      disabled={isSubmitting}
                      required
                    >
                      <option value="" disabled className="bg-gray-900">Où t'en es financièrement...</option>
                      <option value="Pas encore lancé (0€)" className="bg-gray-900">Pas encore lancé (0€)</option>
                      <option value="< 1000€/mois" className="bg-gray-900">&lt; 1000€/mois</option>
                      <option value="1000€ - 5000€/mois" className="bg-gray-900">1000€ - 5000€/mois</option>
                      <option value="5000€ - 10 000€/mois" className="bg-gray-900">5000€ - 10 000€/mois</option>
                      <option value="10 000€+/mois" className="bg-gray-900">10 000€+/mois</option>
                    </select>
                  </div>

                  {/* Intérêt SaaS */}
                  <div>
                    <label htmlFor="interesse_saas" className="mb-2 block text-sm font-medium text-gray-200">
                      Si on lançait un SaaS qui fait ça, tu serais chaud ?
                    </label>
                    <p className="mb-3 text-xs text-gray-400">
                      Instance n8n hébergée + workflows auto-générés par prompt + debug IA + assistant pour tes prompts. Moins cher que de tout gérer toi-même.
                    </p>
                    <select
                      id="interesse_saas"
                      name="interesse_saas"
                      value={form.interesse_saas}
                      onChange={(e) => setForm((p) => ({ ...p, interesse_saas: e.target.value }))}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      disabled={isSubmitting}
                      required
                    >
                      <option value="" disabled className="bg-gray-900">Ton avis ?</option>
                      <option value="Oui, carrément ! Préviens-moi en premier 🔥" className="bg-gray-900">Oui, carrément ! Préviens-moi en premier 🔥</option>
                      <option value="Peut-être, ça dépend du prix" className="bg-gray-900">Peut-être, ça dépend du prix</option>
                      <option value="Non, je préfère gérer moi-même" className="bg-gray-900">Non, je préfère gérer moi-même</option>
                    </select>
                  </div>

                  {/* Message d'erreur */}
                  {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  {/* Bouton submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full transform rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 text-lg font-bold text-white shadow-lg shadow-purple-500/50 transition-all hover:scale-[1.02] hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/80 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "⏳ Génération de ton accès..." : "🔥 J'accède aux workflows maintenant"}
                  </button>

                  {/* Footer formulaire */}
                  <p className="mt-4 text-center text-xs text-gray-400">
                    Zéro spam, juste les workflows. Et si le SaaS t'intéresse, tu seras dans les premiers au courant. 🤝
                  </p>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
