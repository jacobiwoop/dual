import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Save, Loader2, Check, AlertCircle, X, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { profileService, CreatorProfile, UpdateProfilePayload } from '@/services/profile';
import { CropModal } from '@/components/CropModal';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ['Général','BDSM','Fétichisme','Cosplay','Lingerie','Roleplay','Domination','Soft','Latex','Pieds','Lactation','Bbw','Trans','Couples'];
const HAIR_OPTS   = ['Brune','Blonde','Rousse','Noire','Châtain','Colorée'];
const EYE_OPTS    = ['Verts','Bleus','Marron','Noisette','Gris','Noirs'];
const BODY_OPTS   = ['Mince','Athlétique','Curvy','Petite','BBW'];
const TATTOO_OPTS = ['Non','Quelques','Beaucoup'];
const COUNTRY_OPTS = ['France','Belgique','Suisse','Canada','Maroc','Tunisie','Algérie','Autre'];

function parseJson<T>(str: string | null, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
        <span className={`w-8 h-1 rounded-full ${color}`} /> {title}
      </h2>
      {children}
    </section>
  );
}

const INPUT = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm";
const SELECT = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none text-sm";

// ── dataURL → File ────────────────────────────────────────────────────────────
function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr  = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  const u8   = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
  return new File([u8], filename, { type: mime });
}

// ── Main Component ────────────────────────────────────────────────────────────
export function Profile() {
  const { user } = useAuth();

  const [profile, setProfile]   = useState<CreatorProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form fields
  const [displayName, setDisplayName]         = useState('');
  const [username, setUsername]               = useState('');
  const [age, setAge]                         = useState('');
  const [country, setCountry]                 = useState('');
  const [welcomeMessage, setWelcomeMessage]   = useState('');
  const [subscriberMsg, setSubscriberMsg]     = useState('');
  const [categories, setCategories]           = useState<string[]>([]);
  const [tags, setTags]                       = useState<string[]>([]);
  const [tagInput, setTagInput]               = useState('');
  const [profilePhotos, setProfilePhotos]     = useState<string[]>([]);
  const [bannerPreview, setBannerPreview]     = useState<string | null>(null);
  const [height, setHeight]                   = useState('');
  const [hairColor, setHairColor]             = useState('');
  const [eyeColor, setEyeColor]               = useState('');
  const [bodyType, setBodyType]               = useState('');
  const [tattoos, setTattoos]                 = useState('');
  const [subPrice, setSubPrice]               = useState(0);

  // CropModal state
  const [cropModal, setCropModal] = useState<{
    open: boolean; src: string; aspect: '1:1' | '16:9'; target: 'banner' | number;
  }>({ open: false, src: '', aspect: '16:9', target: 'banner' });

  const coverInputRef   = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const activeSlotRef   = useRef<number>(0);

  // ── Load profile ────────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const p = await profileService.getProfile();
      setProfile(p);
      setDisplayName(p.displayName ?? '');
      setUsername(p.username ?? '');
      setAge(p.age?.toString() ?? '');
      setCountry(p.country ?? '');
      setWelcomeMessage(p.welcomeMessage ?? '');
      setSubscriberMsg(p.subscriberWelcomeMsg ?? '');
      setCategories(parseJson(p.categories, []));
      setTags(parseJson(p.tags, []));
      setProfilePhotos(parseJson(p.profilePhotos, []));
      setHeight(p.height ?? '');
      setHairColor(p.hairColor ?? '');
      setEyeColor(p.eyeColor ?? '');
      setBodyType(p.bodyType ?? '');
      setTattoos(p.tattoos ?? '');
      setSubPrice(p.subscriptionPrice ?? 0);
    } catch {
      setError('Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const payload: UpdateProfilePayload = {
        displayName: displayName || undefined,
        username: username || undefined,
        subscriptionPrice: subPrice,
        age: age ? Number(age) : null,
        country: country || undefined,
        welcomeMessage: welcomeMessage || undefined,
        subscriberWelcomeMsg: subscriberMsg || undefined,
        categories, tags, profilePhotos,
        height: height || undefined,
        hairColor: hairColor || undefined,
        eyeColor: eyeColor || undefined,
        bodyType: bodyType || undefined,
        tattoos: tattoos || undefined,
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

  // ── File pickers → CropModal ────────────────────────────────────────────────
  const openFilePicker = (target: 'banner' | number) => {
    if (target === 'banner') coverInputRef.current?.click();
    else { activeSlotRef.current = target as number; profileInputRef.current?.click(); }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'profile') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      setCropModal({
        open: true, src,
        aspect: type === 'banner' ? '16:9' : '1:1',
        target: type === 'banner' ? 'banner' : activeSlotRef.current,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── After crop → upload to R2 ───────────────────────────────────────────────
  const handleCropComplete = async (dataUrl: string) => {
    setUploading(true);
    try {
      const file = dataUrlToFile(dataUrl, `photo-${Date.now()}.jpg`);

      if (cropModal.target === 'banner') {
        const publicUrl = await profileService.uploadAndSetBanner(file);
        setBannerPreview(publicUrl);
        setProfile(prev => prev ? { ...prev, bannerUrl: publicUrl } : null);
      } else {
        const slotIndex = cropModal.target as number;
        // Show optimistic preview
        setProfilePhotos(prev => {
          const next = [...prev];
          next[slotIndex] = dataUrl;
          return next;
        });
        // Upload and save
        const publicUrl = await profileService.uploadImage(file);
        const updated = await profileService.addProfilePhoto(publicUrl);
        setProfilePhotos(updated);
      }
    } catch {
      setError("Erreur lors de l'upload de la photo");
    } finally {
      setUploading(false);
    }
  };

  // ── Categories ──────────────────────────────────────────────────────────────
  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : prev.length >= 3 ? prev : [...prev, cat]
    );
  };

  // ── Tags ────────────────────────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const removePhotoSlot = async (index: number) => {
    try {
      const updated = await profileService.removeProfilePhoto(index);
      setProfilePhotos(updated);
    } catch { setError('Erreur suppression photo'); }
  };

  const currentBanner = bannerPreview ?? profile?.bannerUrl;

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        {[220, 160, 200, 220, 180].map((h, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-3xl" style={{ height: h }} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
      {/* Hidden file inputs */}
      <input ref={coverInputRef}   type="file" accept="image/*" className="hidden" onChange={e => handleFileSelected(e, 'banner')} />
      <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelected(e, 'profile')} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mon Profil</h1>
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${saved ? 'bg-green-600 text-white shadow-green-600/20' : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/20'} disabled:opacity-60`}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Enregistrer'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertCircle size={16} className="shrink-0" /> {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <Loader2 size={14} className="animate-spin" /> Upload en cours…
        </div>
      )}

      <div className="space-y-6">

        {/* ── Photos ── */}
        <Section title="Photos" color="bg-purple-500">
          {/* Bannière */}
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo de couverture</label>
          <div
            className="relative h-36 md:h-48 w-full rounded-2xl overflow-hidden group bg-gradient-to-br from-purple-100 to-pink-100 cursor-pointer mb-6"
            onClick={() => openFilePicker('banner')}
          >
            {currentBanner
              ? <img src={currentBanner} crossOrigin="anonymous" loading="lazy" alt="Couverture" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-purple-300"><Camera size={32} /></div>
            }
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-xl border border-white/40 text-sm font-medium">
                <Camera size={16} /> Changer la couverture
              </span>
            </div>
          </div>

          {/* Photos profil (4 slots) */}
          <label className="block text-sm font-medium text-gray-700 mb-2">Photos de profil (max 4)</label>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => {
              const url = profilePhotos[i];
              return url ? (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer border border-gray-100 shadow-sm">
                  <img src={url} crossOrigin="anonymous" loading="lazy" alt="" className="w-full h-full object-cover" onClick={() => openFilePicker(i)} />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => openFilePicker(i)} className="p-1.5 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => removePhotoSlot(i)} className="p-1.5 bg-white/90 rounded-full text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              ) : (
                <button
                  key={i}
                  onClick={() => openFilePicker(i)}
                  className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 transition-all gap-1"
                >
                  <Plus size={20} />
                  <span className="text-[10px] font-medium">Ajouter</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── Informations ── */}
        <Section title="Informations" color="bg-blue-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom public</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Luna Star" className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input type="text" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())} placeholder="luna_star" className={`${INPUT} pl-7`} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Âge affiché</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="24" min={18} max={99} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
              <select value={country} onChange={e => setCountry(e.target.value)} className={SELECT}>
                <option value="">— Sélectionner —</option>
                {COUNTRY_OPTS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </Section>

        {/* ── Bio & Description ── */}
        <Section title="Bio & Description" color="bg-pink-500">
          <div className="space-y-5">
            {[
              { label: "Message d'accueil (public)", val: welcomeMessage, set: setWelcomeMessage, max: 300, rows: 3 },
              { label: "Message de bienvenue (nouveaux abonnés)", val: subscriberMsg, set: setSubscriberMsg, max: 500, rows: 4 },
            ].map(f => (
              <div key={f.label}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">{f.label}</label>
                  <span className="text-xs text-gray-400">{f.val.length}/{f.max}</span>
                </div>
                <textarea value={f.val} onChange={e => f.set(e.target.value)} maxLength={f.max} rows={f.rows}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none text-sm" />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Catégories & Tags ── */}
        <Section title="Catégories & Tags" color="bg-orange-500">
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Catégories (max 3)</label>
              <span className="text-xs text-gray-400">{categories.length}/3 sélectionnées</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const active   = categories.includes(cat);
                const disabled = !active && categories.length >= 3;
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    disabled={disabled}
                    className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                      active   ? 'bg-gray-900 text-white border-gray-900' :
                      disabled ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed' :
                                 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tags libres</label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                    {tag}
                    <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="hover:text-purple-900"><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Nouveau tag..." className={`${INPUT} flex-1`} />
              <button onClick={addTag} className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">Ajouter</button>
            </div>
          </div>
        </Section>

        {/* ── Physique ── */}
        <Section title="Physique (optionnel)" color="bg-teal-500">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taille</label>
              <input type="text" value={height} onChange={e => setHeight(e.target.value)} placeholder="165cm" className={INPUT} />
            </div>
            {[
              { label: 'Cheveux', val: hairColor, set: setHairColor, opts: HAIR_OPTS },
              { label: 'Yeux',    val: eyeColor,  set: setEyeColor,  opts: EYE_OPTS  },
              { label: 'Morpho',  val: bodyType,  set: setBodyType,  opts: BODY_OPTS },
              { label: 'Tatouages', val: tattoos, set: setTattoos,   opts: TATTOO_OPTS },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                <select value={f.val} onChange={e => f.set(e.target.value)} className={SELECT}>
                  <option value="">— Choisir —</option>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </Section>

      </div>

      {/* CropModal */}
      <CropModal
        isOpen={cropModal.open}
        onClose={() => setCropModal(m => ({ ...m, open: false }))}
        imageSrc={cropModal.src}
        aspect={cropModal.aspect}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
