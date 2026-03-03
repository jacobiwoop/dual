import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Save, Loader2, Check, AlertCircle, X, Edit2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { profileService, CreatorProfile, UpdateProfilePayload } from '@/services/profile';
import { cn } from '@/lib/utils';

function formatCoins(n: number) {
  return n.toLocaleString('fr-FR') + ' 🪙';
}

export function Profile() {
  const { user } = useAuth();

  // ── State ────────────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername]       = useState('');
  const [bio, setBio]                 = useState('');
  const [subPrice, setSubPrice]       = useState(0);

  // Image preview states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // ── Load profile ─────────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const p = await profileService.getProfile();
      setProfile(p);
      setDisplayName(p.displayName ?? '');
      setUsername(p.username ?? '');
      setBio(p.bio ?? '');
      setSubPrice(p.subscriptionPrice ?? 0);
    } catch {
      setError('Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: UpdateProfilePayload = {
        displayName: displayName || undefined,
        username: username || undefined,
        bio: bio || undefined,
        subscriptionPrice: subPrice,
      };
      const updated = await profileService.updateProfile(payload);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar upload ─────────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarUploading(true);
    setError(null);
    try {
      await profileService.uploadAndSetAvatar(file);
    } catch {
      setError('Erreur lors de l\'upload de l\'avatar');
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Banner upload ─────────────────────────────────────────────────────────────
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const previewUrl = URL.createObjectURL(file);
    setBannerPreview(previewUrl);
    setBannerUploading(true);
    setError(null);
    try {
      await profileService.uploadAndSetBanner(file);
    } catch {
      setError('Erreur lors de l\'upload de la bannière');
      setBannerPreview(null);
    } finally {
      setBannerUploading(false);
    }
  };

  const currentAvatar = avatarPreview ?? profile?.avatarUrl ?? user?.avatarUrl;
  const currentBanner = bannerPreview ?? profile?.bannerUrl;

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-purple-500" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24">
      {/* Hidden inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg',
            saved
              ? 'bg-green-600 text-white shadow-green-600/20'
              : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/20'
          )}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Enregistrer'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="space-y-5">

        {/* ── Section : Bannière & Avatar ── */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Banner */}
          <div
            className="relative h-36 md:h-48 w-full bg-gradient-to-br from-purple-100 to-pink-100 cursor-pointer group"
            onClick={() => bannerInputRef.current?.click()}
          >
            {currentBanner ? (
              <img src={currentBanner} alt="Bannière" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-300">
                <Camera size={32} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {bannerUploading ? (
                <Loader2 size={24} className="text-white animate-spin" />
              ) : (
                <span className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-xl border border-white/40 text-sm font-medium">
                  <Camera size={16} /> Changer la bannière
                </span>
              )}
            </div>
          </div>

          {/* Avatar */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div
                className="relative w-20 h-20 rounded-2xl border-4 border-white shadow-lg cursor-pointer group shrink-0"
                onClick={() => avatarInputRef.current?.click()}
              >
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-purple-100 rounded-xl flex items-center justify-center text-purple-400">
                    <Camera size={20} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  {avatarUploading ? (
                    <Loader2 size={16} className="text-white animate-spin" />
                  ) : (
                    <Edit2 size={14} className="text-white" />
                  )}
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900">{displayName || profile?.username || 'Votre nom'}</p>
                <p className="text-sm text-gray-500">@{username || 'username'}</p>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Solde',         value: formatCoins(profile?.coinBalance ?? 0) },
                { label: 'Total gagné',   value: formatCoins(profile?.totalEarned ?? 0) },
                { label: 'Statut KYC',    value: profile?.isVerified ? '✅ Vérifié' : profile?.kycStatus === 'submitted' ? '⏳ En attente' : '⚪ Non soumis' },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-sm font-bold text-gray-900 truncate">{stat.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section : Informations ── */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-1 bg-blue-500 rounded-full" /> Informations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom public</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Votre nom affiché"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom d'utilisateur</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                  placeholder="username"
                  className="w-full pl-7 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all text-sm"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Lettres, chiffres, underscore uniquement</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={profile?.email ?? ''}
                disabled
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix d'abonnement (Pièces)</label>
              <input
                type="number"
                value={subPrice}
                min={0}
                onChange={e => setSubPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all text-sm"
              />
              <p className="text-[10px] text-gray-400 mt-1">0 = gratuit</p>
            </div>
          </div>
        </section>

        {/* ── Section : Bio ── */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-1 bg-pink-500 rounded-full" /> Bio
          </h2>
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Description publique</label>
              <span className="text-xs text-gray-400">{bio.length}/500</span>
            </div>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Décris-toi en quelques mots..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-none text-sm"
            />
          </div>
        </section>

      </div>
    </div>
  );
}
