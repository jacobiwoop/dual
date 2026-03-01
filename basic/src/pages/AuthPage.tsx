import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Chrome } from 'lucide-react';

type Tab = 'login' | 'register';

const FEATURES = [
  { emoji: '🎥', title: 'Lives exclusifs', desc: 'Accès aux webcams en direct 24h/24' },
  { emoji: '💬', title: 'Chat privé', desc: 'Échangez avec vos créatrices préférées' },
  { emoji: '🪙', title: 'Système Coins', desc: 'Envoyez des tips et déverrouillez du contenu' },
  { emoji: '🔔', title: 'Alertes Live', desc: 'Notifiée dès que votre modèle passe en direct' },
];

export const AuthPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (tab === 'register' && !username)) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    // Simule une requête async
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── GAUCHE : Visuel & Features ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-12 text-white relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.png" alt="Basic Instinct" className="h-10 object-contain" />
          <div>
            <span className="text-xl font-bold tracking-tight">Basic</span>{' '}
            <span className="text-xl font-bold text-gray-400 tracking-tight">Instinct</span>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold leading-tight mb-3">
              Le contenu adulte<br />réinventé.
            </h2>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Rejoins des milliers de membres et accède à un univers de créateurs en toute confidentialité.
            </p>
          </div>

          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-4 group">
              <div className="w-10 h-10 bg-white/5 group-hover:bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors text-lg">
                {f.emoji}
              </div>
              <div>
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="relative z-10 text-gray-600 text-xs">
          © 2025 Basic Instinct — Tous droits réservés. 18+
        </p>
      </div>

      {/* ── DROITE : Formulaire ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
        {/* Logo mobile */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <img src="/logo.png" alt="Basic Instinct" className="h-9 object-contain" />
          <span className="text-lg font-bold text-gray-900">Basic <span className="text-gray-400">Instinct</span></span>
        </div>

        <div className="w-full max-w-sm">
          {/* Onglets */}
          <div className="flex bg-gray-200 rounded-xl p-1 mb-8">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === t
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'login' ? 'Se connecter' : "S'inscrire"}
              </button>
            ))}
          </div>

          {/* Titre */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {tab === 'login' ? 'Bon retour 👋' : 'Créer un compte'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {tab === 'login'
                ? 'Connecte-toi pour accéder à ton compte.'
                : 'Rejoins la communauté Basic Instinct.'}
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="john_doe"
                    className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Adresse Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <p className="text-red-500 text-xs font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {tab === 'login' && (
              <div className="text-right">
                <button type="button" className="text-xs text-gray-500 hover:text-gray-900 font-semibold underline underline-offset-2">
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            {/* Bouton principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Chargement…
                </>
              ) : (
                tab === 'login' ? 'Se connecter' : 'Créer mon compte'
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <button
              type="button"
              disabled
              title="Bientôt disponible"
              className="w-full py-3 bg-white border border-gray-200 text-gray-400 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
            >
              <Chrome size={16} />
              Continuer avec Google
              <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-normal">Bientôt</span>
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
            En continuant, vous acceptez nos{' '}
            <span className="underline cursor-pointer hover:text-gray-700">CGU</span> et confirmez avoir{' '}
            <span className="font-bold text-gray-700">18 ans ou plus</span>.
          </p>
        </div>
      </div>

    </div>
  );
};
