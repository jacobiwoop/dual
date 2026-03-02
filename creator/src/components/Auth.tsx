import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { email, password, username, role: 'CREATOR' };

      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      // 1. Sauvegarder le token via le context (qui s'occupe du localStorage et du set state global)
      login(data.token, data.user);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl shadow-black/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-purple-500/20 mb-4">
            B
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Connexion Créateur' : 'Créer un compte Créateur'}
          </h1>
          <p className="text-gray-500 mt-2 text-center text-sm">
            {isLogin ? 'Accédez à votre espace Basic Instinct' : 'Rejoignez-nous et commencez à monétiser'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-in fade-in">
            <Activity size={16} />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                required
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              required
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              required
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-black/10 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-6"
          >
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
            {!loading && <ArrowRight size={20} />}
          </button>

        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-gray-500 hover:text-gray-900 font-medium transition-colors text-sm"
          >
            {isLogin ? 'Pas encore de compte ? Inscrivez-vous' : 'Déjà un compte ? Connectez-vous'}
          </button>
        </div>

      </div>
    </div>
  );
}
