import { useState } from 'react';
import { Plus, Image as ImageIcon, Video, Lock, Trash2, Edit2, Upload, GripVertical, X } from 'lucide-react';
import { GALLERIES, MEDIA_ITEMS, Gallery } from '@/data/mockData';
import { Modal } from '@/components/ui/Modal';
import { useDropzone } from 'react-dropzone';
import { EditGalleryModal } from '@/components/EditGalleryModal';
import { UploadMediaModal } from '@/components/UploadMediaModal';

export function Media() {
  const [activeTab, setActiveTab] = useState<'galleries' | 'free'>('galleries');
  const [isCreateGalleryOpen, setIsCreateGalleryOpen] = useState(false);
  const [isUploadMediaOpen, setIsUploadMediaOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);

  // Mock Dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => console.log(acceptedFiles),
  } as any);

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Médias</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsCreateGalleryOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Créer une galerie
          </button>
          <button 
            onClick={() => setIsUploadMediaOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
          >
            <Upload size={18} />
            Uploader des médias
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
      {activeTab === 'galleries' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERIES.map((gallery) => (
            <div key={gallery.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-all">
              <div className="relative h-48 bg-gray-100">
                <img src={gallery.coverUrl} alt={gallery.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  {gallery.price > 0 ? <><Lock size={12} /> {gallery.price}🪙</> : 'Gratuit'}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{gallery.title}</h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setSelectedGallery(gallery)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-purple-600 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{gallery.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50">
                  <span>{gallery.items.length || 5} médias</span>
                  <span>{gallery.sales} ventes · {gallery.totalRevenue}🪙</span>
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
            {MEDIA_ITEMS.map((item) => (
              <div key={item.id} className="aspect-square rounded-2xl overflow-hidden relative group bg-gray-100 border border-gray-100 shadow-sm">
                <img src={item.url} alt="Media" className="w-full h-full object-cover" />
                
                {/* Type Icon */}
                <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-lg text-white">
                  {item.type === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                </div>

                {/* Price Tag */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-gray-900 shadow-sm">
                  {item.price > 0 ? `${item.price}🪙` : item.visibility === 'subscribers' ? 'Abo' : 'Libre'}
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
      <CreateGalleryModal isOpen={isCreateGalleryOpen} onClose={() => setIsCreateGalleryOpen(false)} />
      <UploadMediaModal isOpen={isUploadMediaOpen} onClose={() => setIsUploadMediaOpen(false)} />
      <EditGalleryModal
        gallery={selectedGallery}
        isOpen={!!selectedGallery}
        onClose={() => setSelectedGallery(null)}
        onSave={(g) => console.log('Gallery saved:', g)}
      />
    </div>
  );
}

function CreateGalleryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une galerie">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la galerie</label>
          <input type="text" placeholder="Ex: Pack Intense" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea rows={3} placeholder="Décrivez le contenu..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Image de couverture</label>
          <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-colors cursor-pointer">
            <ImageIcon size={24} className="mb-2" />
            <span className="text-sm">Choisir une image</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Visibilité</label>
          <div className="flex gap-4">
            {['Payante (🪙)', 'Abonnés', 'Gratuite'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="visibility" className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prix (🪙)</label>
          <input type="number" placeholder="800" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
        </div>

        <div className="pt-4 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
          <button className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">Créer</button>
        </div>
      </div>
    </Modal>
  );
}

