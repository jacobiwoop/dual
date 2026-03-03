# 📋 Creator.4 - Library & Media Upload - Plan d'Implémentation

**Date** : 3 Mars 2026  
**Durée estimée** : 1-2 heures  
**Backend** : ✅ 100% Ready (Phase 2)  
**Service** : ✅ DÉJÀ COMPLET !

---

## 🎯 Situation Actuelle

### ✅ Ce qui EST déjà fait

#### Services (100% ✅)
**`creator/src/services/library.ts`** - COMPLET !
- ✅ `getItems()` - Liste médias avec filtres
- ✅ `deleteItem()` - Suppression R2 + DB
- ✅ `moveItem()` - Déplacer vers folder
- ✅ `getStats()` - Statistiques
- ✅ `getFolders()` - Liste folders
- ✅ `createFolder()` - Créer folder
- ✅ `updateFolder()` - Modifier folder
- ✅ `deleteFolder()` - Supprimer folder
- ✅ `requestUploadUrl()` - Obtenir signed URL
- ✅ `uploadToR2()` - Upload direct R2 avec progress
- ✅ `confirmUpload()` - Confirmer + processing
- ✅ **`uploadFile()`** - Upload complet en une fonction !

**Types** :
- ✅ LibraryItem
- ✅ LibraryFolder
- ✅ LibraryStats

#### Composants Existants
**`creator/src/components/Library.tsx`** - Déjà connecté à l'API !
- ✅ Utilise `libraryService.getItems()`
- ✅ Utilise `libraryService.getFolders()`
- ✅ Gestion upload avec progress
- ✅ Gestion folders (create, delete, move)
- ✅ État: `uploadingFiles[]` avec progress

**`creator/src/components/UploadMediaModal.tsx`** - Modal upload
- ✅ Preview fichier
- ✅ Drag & drop
- ✅ Callback `onUpload`

**`creator/src/components/Media.tsx`** - Page média
- ✅ Ouvre UploadMediaModal
- ✅ Gestion state

---

## ⚠️ Ce qui RESTE à faire

### Problèmes Identifiés

#### 1. Library.tsx - Code Upload Incomplet
**Ligne ~200** : Appel à `libraryService.uploadFile()` mais :
- ⚠️ Pas de gestion d'erreur complète
- ⚠️ État `uploadingFiles` peut ne pas se mettre à jour correctement
- ⚠️ Progress peut ne pas s'afficher

**À vérifier** :
```typescript
// Est-ce que le code ressemble à ça ?
const item = await libraryService.uploadFile(
  file,
  selectedFolder,
  (progress) => {
    // Met à jour uploadingFiles
  }
);
```

#### 2. UploadMediaModal.tsx - Pas de vraie logique upload
**Problème** :
- Le modal a juste un callback `onUpload(file)`
- Il ne fait pas l'upload lui-même
- C'est Library.tsx qui fait l'upload

**À vérifier** :
- Est-ce que le modal affiche le progress ?
- Est-ce que le modal bloque pendant l'upload ?

#### 3. Tests End-to-End
- ⚠️ Jamais testé avec le vrai backend R2
- ⚠️ Processing (thumbnails + variantes) jamais vérifié

---

## 📋 Plan d'Action

### Phase 1 - Vérification & Debug (30 min)

#### Tâche 1.1 - Tester Upload Actuel
**Actions** :
1. Lancer backend + frontend
2. Aller dans Library
3. Essayer d'uploader une image
4. Observer console (Network tab)
5. Noter les erreurs

**Questions à répondre** :
- ✅ L'upload démarre-t-il ?
- ✅ Le progress s'affiche-t-il ?
- ✅ L'upload vers R2 fonctionne-t-il ?
- ✅ Le confirm fonctionne-t-il ?
- ✅ Le processing démarre-t-il (backend logs) ?
- ✅ L'item apparaît-il dans la liste ?

#### Tâche 1.2 - Identifier les Bugs
**À vérifier dans le code** :

**Library.tsx** - Ligne ~200 :
```typescript
const handleFileUpload = async (file: File) => {
  // Vérifier cette logique
  const uploadId = Math.random().toString();
  
  setUploadingFiles(prev => [...prev, {
    id: uploadId,
    name: file.name,
    progress: 0,
    done: false,
    error: null,
  }]);

  try {
    const item = await libraryService.uploadFile(
      file,
      selectedFolder?.id,
      (progress) => {
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadId ? { ...f, progress } : f
        ));
      }
    );

    // Ajouter à la liste
    setItems(prev => [item, ...prev]);
    
    // Marquer comme done
    setUploadingFiles(prev => prev.map(f =>
      f.id === uploadId ? { ...f, done: true, progress: 100 } : f
    ));

  } catch (error) {
    setUploadingFiles(prev => prev.map(f =>
      f.id === uploadId ? { ...f, error: error.message } : f
    ));
  }
};
```

**UploadMediaModal.tsx** - Vérifier :
```typescript
const handleUpload = () => {
  if (file) {
    onUpload(file); // Juste callback
    onClose();      // Ferme immédiatement ?
  }
};
```

---

### Phase 2 - Corrections (30 min)

#### Tâche 2.1 - Corriger Library.tsx (si besoin)
**Si l'upload ne fonctionne pas** :

1. Vérifier que `handleFileUpload` existe et est appelé
2. Vérifier que `uploadingFiles` state est bien mis à jour
3. Ajouter logs console pour debug
4. Gérer les erreurs proprement

**Code à ajouter/corriger** :
```typescript
// Dans Library.tsx

const handleFileUpload = async (file: File) => {
  const uploadId = Date.now().toString();
  
  console.log('📤 Starting upload:', file.name);
  
  setUploadingFiles(prev => [...prev, {
    id: uploadId,
    name: file.name,
    progress: 0,
    done: false,
    error: null,
  }]);

  try {
    const item = await libraryService.uploadFile(
      file,
      selectedFolder?.id || null,
      (progress) => {
        console.log(`📊 Upload progress: ${progress}%`);
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadId ? { ...f, progress } : f
        ));
      }
    );

    console.log('✅ Upload complete:', item);
    
    // Ajouter à la liste
    setItems(prev => [item, ...prev]);
    
    // Marquer comme done
    setUploadingFiles(prev => prev.map(f =>
      f.id === uploadId ? { ...f, done: true, progress: 100 } : f
    ));

    // Retirer après 3 secondes
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
    }, 3000);

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    setUploadingFiles(prev => prev.map(f =>
      f.id === uploadId ? { ...f, error: error.message || 'Upload failed' } : f
    ));
  }
};
```

#### Tâche 2.2 - Améliorer UploadMediaModal (si besoin)
**Si le modal ferme trop vite** :

Option A : Faire l'upload DANS le modal
```typescript
// UploadMediaModal.tsx
const [uploading, setUploading] = useState(false);
const [progress, setProgress] = useState(0);

const handleUpload = async () => {
  if (!file) return;
  
  setUploading(true);
  
  try {
    const item = await libraryService.uploadFile(
      file,
      null,
      (pct) => setProgress(pct)
    );
    
    onUpload(item); // Passer l'item complet
    onClose();
  } catch (error) {
    alert('Upload failed');
  } finally {
    setUploading(false);
  }
};
```

Option B : Garder le callback mais afficher progress dans Library
- Laisser le modal simple
- Afficher progress dans Library.tsx
- **Recommandé** car plus flexible

---

### Phase 3 - Tests & Validation (30 min)

#### Tâche 3.1 - Test Upload Image
**Scénario** :
1. Upload image JPG (< 5MB)
2. Vérifier progress bar
3. Vérifier item apparaît dans liste
4. Attendre 10 secondes
5. Refresh la page
6. Vérifier thumbnail généré

**Backend à observer** :
```
Socket.io: User authenticated
Queued media processing job: xxx
Worker processing job xxx
✅ Thumbnail generated
✅ Image variants generated
```

#### Tâche 3.2 - Test Upload Vidéo
**Scénario** :
1. Upload vidéo MP4 (< 20MB)
2. Vérifier progress (plus lent)
3. Vérifier item apparaît
4. Attendre processing

#### Tâche 3.3 - Test Folders
**Scénario** :
1. Créer folder "Test"
2. Upload image dans "Test"
3. Vérifier item dans bon folder
4. Déplacer item vers root
5. Supprimer folder

#### Tâche 3.4 - Test Edge Cases
**Scénarios** :
- Upload fichier trop gros (> 100MB)
- Upload type non supporté (.txt)
- Upload pendant déconnexion
- Upload multiple en parallèle (3 fichiers)

---

### Phase 4 - Polish & UX (30 min)

#### Tâche 4.1 - Progress Indicator UI
**Améliorer l'affichage du progress** :
```typescript
// Dans Library.tsx - Zone d'upload en cours
{uploadingFiles.map(file => (
  <div key={file.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
    <div className="flex-1">
      <p className="text-sm font-medium">{file.name}</p>
      <div className="mt-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-blue-600 h-2 transition-all duration-300"
          style={{ width: `${file.progress}%` }}
        />
      </div>
    </div>
    {file.error && <span className="text-red-600 text-sm">{file.error}</span>}
    {file.done && <span className="text-green-600">✓</span>}
  </div>
))}
```

#### Tâche 4.2 - Processing Indicator
**Afficher le processing en cours** :
```typescript
// Après upload, afficher "Processing..." sur l'item
<div className="relative">
  <img src={item.url} />
  {!item.thumbnailUrl && (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <div className="text-white text-sm">
        <div className="animate-spin">⚙️</div>
        Processing...
      </div>
    </div>
  )}
</div>
```

#### Tâche 4.3 - Error Messages
**Améliorer les messages d'erreur** :
```typescript
// Erreurs spécifiques
const getErrorMessage = (error: any) => {
  if (error.response?.status === 413) {
    return 'Fichier trop volumineux (max 100MB)';
  }
  if (error.response?.status === 400) {
    return 'Type de fichier non supporté';
  }
  if (error.message?.includes('Network')) {
    return 'Erreur réseau. Vérifiez votre connexion.';
  }
  return error.message || 'Erreur d\'upload';
};
```

---

## 🧪 Checklist de Validation

### Upload
- [ ] Upload image JPG/PNG
- [ ] Upload vidéo MP4
- [ ] Progress bar 0% → 100%
- [ ] Item apparaît dans liste immédiatement
- [ ] Thumbnail généré après ~10s
- [ ] Variantes générées (vérifier metadata)

### Folders
- [ ] Créer folder
- [ ] Upload dans folder spécifique
- [ ] Déplacer item entre folders
- [ ] Supprimer folder (avec confirmation)
- [ ] Filtrer items par folder

### UI/UX
- [ ] Loading states
- [ ] Error messages clairs
- [ ] Progress indicator visible
- [ ] Processing indicator
- [ ] Responsive (mobile)

### Edge Cases
- [ ] Fichier > 100MB → Erreur claire
- [ ] Type non supporté → Erreur claire
- [ ] Network timeout → Retry possible
- [ ] Multiple uploads simultanés
- [ ] Upload puis refresh page immédiat

---

## 📝 Notes Importantes

### Backend Processing (Rappel)
Après `confirmUpload`, le backend lance automatiquement :

**Pour Images** :
1. Job `generate-thumbnail` → Thumbnail 400x400
2. Job `generate-variants` → 3 variantes (S/M/L)
3. Met à jour `LibraryItem.thumbnailUrl`
4. Met à jour `LibraryItem.metadata` (JSON)

**Durée** : ~10-15 secondes par image

**Pour Vidéos** :
1. Job `process-video` → Metadata extraction
2. Thumbnail (placeholder)
3. Compression (à implémenter)

**Durée** : ~30-60 secondes par vidéo

### URLs R2
**Structure** :
```
https://pub-xxxxx.r2.dev/creators/{creatorId}/{filename}
https://pub-xxxxx.r2.dev/creators/{creatorId}/{filename}_thumb.jpg
https://pub-xxxxx.r2.dev/creators/{creatorId}/{filename}_small.jpg
https://pub-xxxxx.r2.dev/creators/{creatorId}/{filename}_medium.jpg
https://pub-xxxxx.r2.dev/creators/{creatorId}/{filename}_large.jpg
```

### Debugging
**Console logs à ajouter** :
```typescript
console.log('📤 Starting upload:', file.name);
console.log('🔗 Signed URL obtained:', uploadUrl);
console.log('📊 Upload progress:', progress);
console.log('✅ Upload to R2 complete');
console.log('📝 Confirming upload...');
console.log('✅ Upload confirmed:', item);
```

**Network tab à surveiller** :
1. POST `/api/creator/media/upload-url` → 200 OK
2. PUT `https://...r2.cloudflarestorage.com/...` → 200 OK
3. POST `/api/creator/media/confirm` → 200 OK

---

## ⏱️ Estimation Finale

| Phase | Durée | Tâches |
|-------|-------|--------|
| 1. Vérification & Debug | 30 min | Test actuel + identifier bugs |
| 2. Corrections | 30 min | Fix Library.tsx si besoin |
| 3. Tests & Validation | 30 min | 4 scénarios de test |
| 4. Polish & UX | 30 min | UI improvements |
| **TOTAL** | **~2h** | **Si tout fonctionne déjà : 1h** |

---

## 🎯 Prochaines Étapes Immédiates

1. **Lancer les serveurs** :
   ```bash
   Terminal 1: cd basic-instinct-api && npm run dev
   Terminal 2: cd creator && npm run dev
   ```

2. **Tester upload actuel** :
   - Aller sur http://localhost:3000/library
   - Essayer d'uploader une image
   - Observer console + Network tab

3. **Identifier les problèmes** :
   - Noter les erreurs
   - Vérifier les logs backend
   - Checker les requêtes HTTP

4. **Appliquer les corrections** :
   - Corriger Library.tsx si besoin
   - Améliorer UI si besoin

5. **Valider** :
   - Upload multiple types
   - Vérifier processing
   - Tester folders

---

**Status** : ⏳ Prêt à démarrer  
**Difficulté** : 🟢 Facile (service déjà complet!)  
**Impact** : 🔥 Élevé (feature clé pour créateurs)
