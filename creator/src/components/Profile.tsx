import { useState, useRef } from 'react';
import { Camera, Edit2, Save, Plus, X } from 'lucide-react';
import { CURRENT_USER } from '@/data/mockData';
import { CropModal } from '@/components/CropModal';

type PhotoSlot = { src: string | null; id: number };

export function Profile() {
  const [user]           = useState(CURRENT_USER);
  const [coverSrc, setCoverSrc]   = useState(user.cover);
  const [profilePhotos, setProfilePhotos] = useState<PhotoSlot[]>([
    { id: 0, src: user.avatar },
    { id: 1, src: user.avatar },
    { id: 2, src: null },
    { id: 3, src: null },
  ]);

  const [cropModal, setCropModal] = useState<{
    open: boolean;
    src: string;
    aspect: '1:1' | '16:9';
    target: 'cover' | number;
  }>({ open: false, src: '', aspect: '1:1', target: 'cover' });

  const coverInputRef   = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const activeSlotRef   = useRef<number>(0);

  const [bio, setBio]               = useState(user.bio);
  const [welcome, setWelcome]       = useState(user.welcomeMessage);
  const [categories, setCategories] = useState<string[]>(user.categories);
  const [tags, setTags]             = useState<string[]>(user.tags);
  const [newTag, setNewTag]         = useState('');

  const openFilePicker = (target: 'cover' | number) => {
    if (target === 'cover') coverInputRef.current?.click();
    else { activeSlotRef.current = target; profileInputRef.current?.click(); }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'profile') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      setCropModal({
        open: true,
        src,
        aspect: type === 'cover' ? '16:9' : '1:1',
        target: type === 'cover' ? 'cover' : activeSlotRef.current,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = (dataUrl: string) => {
    if (cropModal.target === 'cover') {
      setCoverSrc(dataUrl);
    } else {
      setProfilePhotos(prev => prev.map(p =>
        p.id === cropModal.target ? { ...p, src: dataUrl } : p
      ));
    }
  };

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat));
    } else if (categories.length < 3) {
      setCategories([...categories, cat]);
    }
  };

  const addTag = () => {
    const t = newTag.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setNewTag(''); }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
      {/* Hidden file inputs */}
      <input ref={coverInputRef}   type="file" accept="image/*" className="hidden" onChange={e => handleFileSelected(e, 'cover')} />
      <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelected(e, 'profile')} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mon Profil</h1>
        <button className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 text-sm">
          <Save size={16} /> Enregistrer
        </button>
      </div>

      <div className="space-y-6">

        {/* ── Photos ── */}
        <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-8 h-1 bg-purple-500 rounded-full" /> Photos
          </h2>

          {/* Cover */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo de couverture</label>
            <div
              className="relative h-36 md:h-48 w-full rounded-2xl overflow-hidden group bg-gray-100 cursor-pointer"
              onClick={() => openFilePicker('cover')}
            >
              <img src={coverSrc} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-xl border border-white/40 text-sm font-medium">
                  <Camera size={16} /> Changer la couverture
                </span>
              </div>
            </div>
          </div>

          {/* Profile photos 4 slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos de profil (max 4)</label>
            <div className="grid grid-cols-4 gap-3">
              {profilePhotos.map(slot => (
                slot.src ? (
                  <div
                    key={slot.id}
                    className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer border border-gray-100 shadow-sm"
                    onClick={() => openFilePicker(slot.id)}
                  >
                    <img src={slot.src} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Edit2 size={18} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <button
                    key={slot.id}
                    onClick={() => openFilePicker(slot.id)}
                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 transition-all gap-1"
                  >
                    <Plus size={20} />
                    <span className="text-[10px] font-medium">Ajouter</span>
                  </button>
                )
              ))}
            </div>
          </div>
        </section>

        {/* ── Informations ── */}
        <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-8 h-1 bg-blue-500 rounded-full" /> Informations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Nom public',        type: 'text',   def: user.displayName,  prefix: undefined },
              { label: 'Nom d\'utilisateur', type: 'text',   def: user.username.replace('@', ''), prefix: '@' },
              { label: 'Âge affiché',       type: 'number', def: '24',              prefix: undefined },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                <div className="relative">
                  {f.prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{f.prefix}</span>}
                  <input
                    type={f.type}
                    defaultValue={f.def}
                    className={`w-full ${f.prefix ? 'pl-7' : 'pl-4'} pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm`}
                  />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none text-sm">
                {['France', 'Belgique', 'Suisse', 'Canada'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* ── Bio ── */}
        <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-8 h-1 bg-pink-500 rounded-full" /> Bio & Description
          </h2>
          <div className="space-y-5">
            {[
              { label: "Message d'accueil (public)", val: bio, set: setBio, max: 300, rows: 3 },
              { label: "Message de bienvenue (nouveaux abonnés)", val: welcome, set: setWelcome, max: 500, rows: 4 },
            ].map(f => (
              <div key={f.label}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">{f.label}</label>
                  <span className="text-xs text-gray-400">{f.val.length}/{f.max}</span>
                </div>
                <textarea
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  maxLength={f.max}
                  rows={f.rows}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none text-sm"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Catégories ── */}
        <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-8 h-1 bg-orange-500 rounded-full" /> Catégories & Tags
          </h2>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Catégories (max 3)</label>
              <span className="text-xs text-gray-400">{categories.length}/3 sélectionnées</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Général','BDSM','Fétichisme','Cosplay','Lingerie','Roleplay','Domination','Soft','Latex','Pieds','Lactation','Bbw','Trans','Couples'].map(cat => {
                const active = categories.includes(cat);
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
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100 flex items-center gap-1">
                  {tag}
                  <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-purple-900 ml-0.5"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
                placeholder="Nouveau tag..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
              />
              <button onClick={addTag} className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                Ajouter
              </button>
            </div>
          </div>
        </section>

        {/* ── Physique ── */}
        <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-8 h-1 bg-teal-500 rounded-full" />
            Physique <span className="text-sm font-normal text-gray-400 ml-1">(optionnel)</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taille</label>
              <input type="text" defaultValue={user.physique?.height} placeholder="165cm"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm" />
            </div>
            {[
              { label: 'Cheveux', opts: ['Brune','Blonde','Rousse','Noire','Châtain','Colorée'] },
              { label: 'Yeux',    opts: ['Verts','Bleus','Marron','Noisette','Gris','Noirs'] },
              { label: 'Morpho',  opts: ['Mince','Athlétique','Curvy','Petite','BBW'] },
              { label: 'Tatouages', opts: ['Non','Quelques','Beaucoup'] },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none text-sm">
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </section>

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
