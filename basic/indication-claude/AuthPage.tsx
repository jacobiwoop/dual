import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';

type Tab = 'login' | 'register';

export const AuthPage = () => {
  const navigate = useNavigate();
  const [tab, setTab]               = useState<Tab>('login');
  const [showPass, setShowPass]     = useState(false);
  const [showPass2, setShowPass2]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // Champs login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass]   = useState('');

  // Champs register
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail]       = useState('');
  const [regPass, setRegPass]         = useState('');
  const [regPass2, setRegPass2]       = useState('');
  const [ageCheck, setAgeCheck]       = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPass) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    // Simuler un appel API
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    navigate('/');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regUsername || !regEmail || !regPass || !regPass2) { setError('Veuillez remplir tous les champs.'); return; }
    if (regPass !== regPass2) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (regPass.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (!ageCheck) { setError('Vous devez confirmer avoir 18 ans ou plus.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Côté gauche — visuel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5E1] via-[#FFE1E1] to-[#FAD0F3]" />
        {/* Cercles décoratifs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200/20 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-16 text-center">
          <img src="/logo.png" alt="Basic Instinct" className="h-20 object-contain mb-8" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Rejoignez la<br />communauté
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
            Connectez-vous avec vos créatrices préférées et accédez à du contenu exclusif.
          </p>

          {/* Features */}
          <div className="mt-12 space-y-4 w-full max-w-xs">
            {[
              { icon: '🔒', text: 'Contenu 100% privé et sécurisé' },
              { icon: '💎', text: 'Accès exclusif aux créatrices premium' },
              { icon: '🪙', text: 'Système de crédits flexible' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/80 shadow-sm">
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm font-medium text-gray-700">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Côté droit — formulaire ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16">

        {/* Logo mobile */}
        <div className="lg:hidden mb-10">
          <img src="/logo.png" alt="Basic Instinct" className="h-14 object-contain mx-auto" />
        </div>

        <div className="w-full max-w-sm">

          {/* Onglets */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                tab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                tab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              S'inscrire
            </button>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* ── FORMULAIRE LOGIN ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="hello@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2 transition-colors">
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <> Se connecter <ArrowRight size={16} /> </>
                )}
              </button>

              {/* Séparateur Google (désactivé) */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">ou continuer avec</span></div>
              </div>

              <button type="button" disabled
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-400 cursor-not-allowed opacity-60">
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.2 6.5 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.2 6.5 29.4 4 24 4c-7.6 0-14.2 4.1-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-3-11.4-7.2l-6.6 5.1C9.7 39.8 16.4 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.5-4.7 5.8l6.2 5.2C40.7 36 44 30.5 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
                Google — Bientôt disponible
              </button>
            </form>
          )}

          {/* ── FORMULAIRE REGISTER ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="mon_pseudo"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="hello@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={regPass}
                    onChange={e => setRegPass(e.target.value)}
                    placeholder="8 caractères minimum"
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass2 ? 'text' : 'password'}
                    value={regPass2}
                    onChange={e => setRegPass2(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass2(!showPass2)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass2 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Checkbox âge */}
              <label className="flex items-start gap-3 cursor-pointer group mt-2">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input type="checkbox" checked={ageCheck} onChange={e => setAgeCheck(e.target.checked)} className="sr-only" />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    ageCheck ? 'bg-gray-900 border-gray-900' : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    {ageCheck && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">
                  Je certifie avoir <strong className="text-gray-900">18 ans ou plus</strong> et j'accepte les{' '}
                  <button type="button" className="underline hover:text-gray-900">CGU</button> et la{' '}
                  <button type="button" className="underline hover:text-gray-900">politique de confidentialité</button>.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <> Créer mon compte <ArrowRight size={16} /> </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
