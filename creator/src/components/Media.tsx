import { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, Video, Lock, Trash2, Edit2, Upload, GripVertical, X } from 'lucide-react';
import { mediaService, MediaItem, Gallery } from '@/services/media';
import { Modal } from '@/components/ui/Modal';
import { useDropzone } from 'react-dropzone';
import { UploadMediaModal } from '@/components/UploadMediaModal';

export function Media() {
  const [activeTab, setActiveTab] = useState<'galleries' | 'free'>('galleries');
  const [isCreateGalleryOpen, setIsCreateGalleryOpen] = useState(false);
  const [isUploadMediaOpen, setIsUploadMediaOpen] = useState(false);
  const [uploadGalleryId, setUploadGalleryId] = useState<string | undefined>(undefined);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [openGallery, setOpenGallery] = useState<(Gallery & { items: MediaItem[] }) | null>(null);
  const [loadingGallery, setLoadingGallery] = useState(false);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, galleriesData] = await Promise.all([
        mediaService.getItems({ limit: 100 }),
        mediaService.getGalleries()
      ]);
      setItems(itemsData.items);
      setGalleries(galleriesData);
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openGalleryView = async (gallery: Gallery) => {
    try {
      setLoadingGallery(true);
      setOpenGallery({ ...gallery, items: [] });
      const details = await mediaService.getGalleryDetails(gallery.id);
      setOpenGallery(details);
    } catch (err) {
      console.error('Error fetching gallery details:', err);
    } finally {
      setLoadingGallery(false);
    }
  };

  // Mock Dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => console.log(acceptedFiles),
  } as any);

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        {openGallery ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setOpenGallery(null)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
            <div>
              <p className="text-xs text-gray-400 font-medium">Galeries</p>
              <h1 className="text-3xl font-bold text-gray-900">{openGallery.title}</h1>
            </div>
          </div>
        ) : (
          <h1 className="text-3xl font-bold text-gray-900">Mes Médias</h1>
        )}
        <div className="flex gap-4">
          {!openGallery && (
            <button 
              onClick={() => setIsCreateGalleryOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Créer une galerie
            </button>
          )}
          <button 
            onClick={() => {
              setUploadGalleryId(openGallery?.id);
              setIsUploadMediaOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
          >
            <Upload size={18} />
            {openGallery ? 'Ajouter des médias' : 'Uploader des médias'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 mb-8">
        <button 
          onClick={() => setActiveTab('galleries')}
          className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'galleries' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          🖼️ Galeries
          {activeTab === 'galleries' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('free')}
          className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'free' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          📷 Médias libres
          {activeTab === 'free' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />}
        </button>
      </div>

      {/* Content */}
      {openGallery ? (
        /* Gallery Detail View */
        <div>
          {/* Gallery Info Banner */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            {openGallery.coverUrl && (
              <img src={openGallery.coverUrl} alt={openGallery.title} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">{openGallery.description || 'Aucune description'}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{openGallery.visibility === 'free' ? 'Gratuite' : openGallery.visibility === 'subscribers' ? 'Abonnés' : `${openGallery.priceCredits}🪙`}</span>
                <span className="text-xs text-gray-400">{openGallery.items?.length || 0} médias</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedGallery(openGallery as any)}
              className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-purple-600 transition-colors"
            >
              <Edit2 size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingGallery ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
              ))
            ) : openGallery.items?.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="text-lg font-medium mb-2">Aucun média dans cette galerie</p>
                <p className="text-sm">Cliquez sur "Ajouter des médias" pour commencer</p>
              </div>
            ) : openGallery.items?.map((item) => (
              <div key={item.id} className="aspect-square rounded-2xl overflow-hidden relative group bg-gray-100 border border-gray-100 shadow-sm">
                <img src={item.thumbnailUrl || item.url} alt="Media" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-lg text-white">
                  {item.type === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 bg-white rounded-xl text-red-500 hover:bg-red-50 transition-colors shadow-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {/* Upload quick add card */}
            <button 
              onClick={() => {
                setUploadGalleryId(openGallery?.id);
                setIsUploadMediaOpen(true);
              }}
              className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 transition-all gap-2"
            >
              <Upload size={24} />
              <span className="text-xs font-medium">Ajouter</span>
            </button>
          </div>
        </div>
      ) : activeTab === 'galleries' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-3xl overflow-hidden h-72 animate-pulse border border-gray-100 flex flex-col relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 via-gray-100 to-gray-200 opacity-50"></div>
                </div>
             ))
          ) : galleries.map((gallery) => (
            <div 
              key={gallery.id} 
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-all cursor-pointer"
              onClick={() => openGalleryView(gallery)}
            >
              <div className="relative h-48 bg-gray-100">
                <img src={gallery.coverUrl} alt={gallery.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  {gallery.priceCredits > 0 ? <><Lock size={12} /> {gallery.priceCredits}🪙</> : 'Gratuit'}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{gallery.title}</h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedGallery(gallery); }}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-purple-600 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{gallery.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50">
                  <span>{gallery._count?.items || 0} médias</span>
                  <span>{gallery.salesCount || 0} ventes · {gallery.revenueCredits || 0}🪙</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Gallery Card */}
          <button 
            onClick={() => setIsCreateGalleryOpen(true)}
            className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-gray-400 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 transition-all min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
              <Plus size={32} />
            </div>
            <span className="font-medium">Créer une galerie</span>
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20">
                <option>Plus récents</option>
                <option>Plus anciens</option>
                <option>Prix croissant</option>
              </select>
              <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20">
                <option>Tous</option>
                <option>Images</option>
                <option>Vidéos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-gray-200 animate-pulse overflow-hidden relative border border-gray-100">
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 via-gray-100 to-gray-200 opacity-50"></div>
                </div>
              ))
            ) : items.map((item) => (
              <div key={item.id} className="aspect-square rounded-2xl overflow-hidden relative group bg-gray-100 border border-gray-100 shadow-sm">
                <img src={item.thumbnailUrl || item.url} alt="Media" className="w-full h-full object-cover" />
                
                {/* Type Icon */}
                <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-lg text-white">
                  {item.type === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                </div>

                {/* Price Tag */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-gray-900 shadow-sm">
                  {item.priceCredits > 0 ? `${item.priceCredits}🪙` : item.visibility === 'subscribers' ? 'Abo' : 'Libre'}
                </div>

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 bg-white rounded-xl text-gray-900 hover:bg-purple-50 hover:text-purple-600 transition-colors shadow-lg transform hover:scale-110">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 bg-white rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-lg transform hover:scale-110">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
             {/* Upload Card */}
             <button 
                onClick={() => setIsUploadMediaOpen(true)}
                className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 transition-all gap-2"
              >
                <Upload size={24} />
                <span className="text-xs font-medium">Upload</span>
              </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateGalleryModal 
        isOpen={isCreateGalleryOpen} 
        onClose={() => setIsCreateGalleryOpen(false)} 
        onCreated={() => {
          setIsCreateGalleryOpen(false);
          fetchData();
        }}
      />
      <UploadMediaModal 
        isOpen={isUploadMediaOpen} 
        onClose={() => { setIsUploadMediaOpen(false); setUploadGalleryId(undefined); }}
        galleryId={uploadGalleryId}
        onUploaded={async () => {
          if (uploadGalleryId && openGallery) {
            // Refresh the current open gallery
            const details = await mediaService.getGalleryDetails(uploadGalleryId);
            setOpenGallery(details);
          } else {
            fetchData();
          }
        }}
      />
      <EditGalleryModal
        gallery={selectedGallery}
        isOpen={!!selectedGallery}
        onClose={() => setSelectedGallery(null)}
        onSaved={() => {
          setSelectedGallery(null);
          fetchData();
        }}
      />
    </div>
  );
}

function CreateGalleryModal({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated: () => void }) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'free' | 'subscribers' | 'paid'>('free');
  const [priceCredits, setPriceCredits] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setCoverFile(null);
    setTitle('');
    setDescription('');
    setVisibility('free');
    setPriceCredits(0);
    setIsSubmitting(false);
    onClose();
  };

  const handleCreate = async () => {
    if (!title.trim()) return alert('Veuillez entrer un nom de galerie');
    
    try {
      setIsSubmitting(true);
      let coverKey;

      if (coverFile) {
         // Upload cover directly to R2
         const { uploadUrl, key } = await mediaService.requestUploadUrl(coverFile.name, coverFile.type, coverFile.size, 'image');
         await mediaService.uploadToR2(uploadUrl, coverFile);
         coverKey = key;
      }

      await mediaService.createGallery({
        title,
        description,
        visibility,
        priceCredits,
        coverKey
      });

      onCreated();
    } catch (err) {
      console.error('Error creating gallery:', err);
      alert('Erreur lors de la création de la galerie');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Créer une galerie">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la galerie</label>
          <input 
            type="text" 
            placeholder="Ex: Pack Intense" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea 
            rows={3} 
            placeholder="Décrivez le contenu..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Image de couverture</label>
          <label className="h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-colors cursor-pointer relative overflow-hidden">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setCoverFile(file);
              }}
            />
            {coverFile ? (
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={URL.createObjectURL(coverFile)} 
                  alt="Aperçu" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">Changer</span>
                </div>
              </div>
            ) : (
              <>
                <ImageIcon size={24} className="mb-2" />
                <span className="text-sm">Choisir une image</span>
              </>
            )}
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Visibilité</label>
          <div className="flex gap-4">
            {[
              { id: 'paid', label: 'Payante (🪙)' },
              { id: 'subscribers', label: 'Abonnés' },
              { id: 'free', label: 'Gratuite' }
            ].map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="visibility" 
                  checked={visibility === opt.id}
                  onChange={() => setVisibility(opt.id as any)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500" 
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {visibility === 'paid' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prix (🪙)</label>
            <input 
              type="number" 
              placeholder="800" 
              value={priceCredits || ''}
              onChange={(e) => setPriceCredits(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" 
            />
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <button 
            onClick={handleClose} 
            disabled={isSubmitting}
            className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button 
            onClick={handleCreate}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Création...' : 'Créer'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function EditGalleryModal({ gallery, isOpen, onClose, onSaved }: { gallery: Gallery | null; isOpen: boolean; onClose: () => void; onSaved: () => void }) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'free' | 'subscribers' | 'paid'>('free');
  const [priceCredits, setPriceCredits] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (gallery && isOpen) {
      setTitle(gallery.title);
      setDescription(gallery.description || '');
      setVisibility(gallery.visibility as 'free' | 'subscribers' | 'paid');
      setPriceCredits(gallery.priceCredits);
      setCoverFile(null);
      setRemoveCover(false);
    }
  }, [gallery, isOpen]);

  const handleClose = () => {
    setCoverFile(null);
    setRemoveCover(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleUpdate = async () => {
    if (!gallery) return;
    if (!title.trim()) return alert('Veuillez entrer un nom de galerie');
    
    try {
      setIsSubmitting(true);
      
      let coverKey: string | null | undefined = undefined;

      if (removeCover) {
        coverKey = null; // Tell API to remove cover
      } else if (coverFile) {
         // Upload new cover directly to R2
         const { uploadUrl, key } = await mediaService.requestUploadUrl(coverFile.name, coverFile.type, coverFile.size, 'image');
         await mediaService.uploadToR2(uploadUrl, coverFile);
         coverKey = key;
      }

      await mediaService.updateGallery(gallery.id, {
        title,
        description,
        visibility,
        priceCredits,
        coverKey
      });

      onSaved();
    } catch (err) {
      console.error('Error updating gallery:', err);
      alert('Erreur lors de la modification de la galerie');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Modifier la galerie">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la galerie</label>
          <input 
            type="text" 
            placeholder="Ex: Pack Intense" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea 
            rows={3} 
            placeholder="Décrivez le contenu..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none" 
          />
        </div>

        <div>
           <div className="flex justify-between items-center mb-2">
             <label className="block text-sm font-medium text-gray-700">Image de couverture</label>
             {gallery?.coverUrl && !coverFile && !removeCover && (
               <button onClick={() => setRemoveCover(true)} className="text-xs text-red-500 hover:text-red-600 font-medium">Retirer l'image</button>
             )}
           </div>
          <label className={`h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-colors cursor-pointer relative overflow-hidden ${(removeCover && !coverFile) ? 'opacity-50' : ''}`}>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setCoverFile(file);
                  setRemoveCover(false);
                }
              }}
            />
            {coverFile ? (
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={URL.createObjectURL(coverFile)} 
                  alt="Aperçu" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">Changer</span>
                </div>
              </div>
            ) : (!removeCover && gallery?.coverUrl) ? (
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={gallery.coverUrl} 
                  alt="Couverture actuelle" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">Changer</span>
                </div>
              </div>
            ) : (
              <>
                <ImageIcon size={24} className="mb-2" />
                <span className="text-sm">{(removeCover && gallery?.coverUrl) ? 'Image retirée. Cliquez pour en remettre une.' : 'Choisir une image'}</span>
              </>
            )}
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Visibilité</label>
          <div className="flex gap-4">
            {[
              { id: 'paid', label: 'Payante (🪙)' },
              { id: 'subscribers', label: 'Abonnés' },
              { id: 'free', label: 'Gratuite' }
            ].map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="visibility" 
                  checked={visibility === opt.id}
                  onChange={() => setVisibility(opt.id as any)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500" 
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {visibility === 'paid' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prix (🪙)</label>
            <input 
              type="number" 
              placeholder="800" 
              value={priceCredits || ''}
              onChange={(e) => setPriceCredits(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" 
            />
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <button 
            onClick={handleClose} 
            disabled={isSubmitting}
            className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button 
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

