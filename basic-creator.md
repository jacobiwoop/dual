# 🎬 Basic Instinct Studio v2 — Interface & Pages

---

## 1. Layout Global

```
┌─────────────┬──────────────────────────────┬─────────────┐
│             │                              │             │
│  SIDEBAR    │       CONTENU PRINCIPAL      │  SIDEBAR    │
│  GAUCHE     │                              │  DROITE     │
│  72px       │      (change par page)       │  280px      │
│  (icons)    │                              │  (messages  │
│             │                              │  seulement) │
│             │                              │             │
└─────────────┴──────────────────────────────┴─────────────┘
```

**Sidebar gauche** — toujours visible, icônes uniquement (72px), tooltip au survol
**Contenu central** — pleine largeur entre les deux sidebars
**Sidebar droite** — visible UNIQUEMENT sur la page Messages (liste clients filtrée)

---

## 2. Sidebar Gauche

```
┌──────────┐
│  [Logo]  │
│          │
│  🏠      │  Dashboard
│  👤      │  Profil
│  🖼️      │  Médias
│  💬  🔴  │  Messages (badge non lus)
│  📋      │  Demandes Spéciales
│  🔔  🔴  │  Notifications
│  ⚙️      │  Paramètres
│          │
│          │
│  💰      │  Revenus (widget bas)
│  [Avatar]│  Mon compte
└──────────┘
```

- Badge rouge sur Messages et Notifications si non lus
- Widget revenus en bas : solde du mois en €
- Avatar en bas → raccourci Settings

---

## 3. Pages

---

### 3.1 ProfilePage `/profile`

```
┌──────────────────────────────────────────────────────────┐
│  Mon Profil                          [ 💾 Enregistrer ]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ── Photos ────────────────────────────────────────────  │
│                                                          │
│  Photo de couverture                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │                  [Image ou zone upload]            │  │
│  │                  📷 Changer la couverture           │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Photos de profil (max 4)                               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│  │ img  │ │ img  │ │  +   │ │  +   │                   │
│  │ ✏️   │ │ ✏️   │ │Ajouter│ │Ajouter│                 │
│  └──────┘ └──────┘ └──────┘ └──────┘                   │
│  (clic → CropModal)                                     │
│                                                          │
│  ── Informations ──────────────────────────────────────  │
│                                                          │
│  Nom public                                              │
│  [ Luna Star                          ]                 │
│                                                          │
│  Nom d'utilisateur                                       │
│  [ @luna_star                         ]                 │
│                                                          │
│  Âge affiché                                            │
│  [ 24                                 ]                 │
│                                                          │
│  Pays                                                    │
│  [ France                          ▾  ]                 │
│                                                          │
│  ── Bio & Description ────────────────────────────────   │
│                                                          │
│  Message d'accueil (affiché sur le profil)              │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Bonjour à tous 🌸 Je partage mes moments...        │  │
│  │                                           150/300  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Message de bienvenue (envoyé au nouveau abonné)        │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Merci de t'être abonné(e) ! 💕 Voici ce qui...     │  │
│  │                                           200/500  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ── Catégories & Tags ─────────────────────────────────  │
│                                                          │
│  Catégories (max 3)                                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [x] Général    [x] BDSM     [ ] Fétichisme       │   │
│  │ [ ] Cosplay    [ ] Lingerie [ ] Roleplay          │   │
│  │ [ ] Domination [ ] Soft     [ ] Latex             │   │
│  │ [ ] Pieds      [ ] Lactation[ ] Bbw               │   │
│  │ [ ] Trans      [ ] Couples  [ ] + Autres...       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Tags libres (apparaissent dans la recherche)           │
│  [ Brunette ] [ France ] [ Long Hair ] [ + Ajouter ]    │
│                                                          │
│  ── Physique (optionnel) ──────────────────────────────  │
│                                                          │
│  Taille      Couleur cheveux   Couleur yeux             │
│  [ 165cm ]   [ Brune       ▾ ] [ Verts        ▾ ]       │
│                                                          │
│  Morphologie         Tatouages                          │
│  [ Mince         ▾ ] [ Non          ▾ ]                 │
│                                                          │
│                              [ 💾 Enregistrer ]         │
└──────────────────────────────────────────────────────────┘
```

#### CropModal (photos profil & couverture)

```
┌──────────────────────────────────────────┐
│  Ajuster la photo                        │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │                                  │    │
│  │     [Zone de recadrage]          │    │
│  │     avec poignées aux coins      │    │
│  │                                  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Ratio : ○ 1:1 (profil) ○ 16:9 (cover)  │
│                                          │
│  [ ↺ Rotation ] [ ↔ Flip ]              │
│                                          │
│  [ Annuler ]            [ ✅ Valider ]   │
└──────────────────────────────────────────┘
```

**Lib recommandée : `react-image-crop` ou `react-easy-crop`**

---

### 3.2 MediaPage `/media`

```
┌──────────────────────────────────────────────────────────┐
│  Mes Médias                [ + Créer une galerie ]       │
│                            [ + Uploader des médias ]     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [ 🖼️ Galeries ] [ 📷 Médias libres ]                    │
│                                                          │
│  ── Onglet Galeries ───────────────────────────────────  │
│                                                          │
│  ┌───────────────────────┐  ┌───────────────────────┐   │
│  │ 🔥 Pack Intense       │  │ 🎭 Pack Cosplay        │   │
│  │ ──────────────────── │  │ ──────────────────── │   │
│  │ [Cover image]        │  │ [Cover image]         │   │
│  │ 3 photos · 1 vidéo   │  │ 5 photos              │   │
│  │ 🔒 800🪙              │  │ 🔒 500🪙              │   │
│  │ 12 achats · 9 600🪙   │  │ 8 achats · 4 000🪙    │   │
│  │ [ ✏️ Éditer ] [ 🗑 ]  │  │ [ ✏️ Éditer ] [ 🗑 ]  │   │
│  └───────────────────────┘  └───────────────────────┘   │
│                                                          │
│  ┌───────────────────────┐  ┌───────────────────────┐   │
│  │ 👑 Galerie Abonnés    │  │  +  Créer une galerie  │   │
│  │ Accès abonnés Normal  │  │                        │   │
│  │ 8 photos              │  │                        │   │
│  │ Gratuit (abonnés)     │  │                        │   │
│  │ [ ✏️ Éditer ]         │  │                        │   │
│  └───────────────────────┘  └───────────────────────┘   │
│                                                          │
│  ── Onglet Médias libres ──────────────────────────────  │
│                                                          │
│  Tri : [ Plus récents ▾ ]   Filtre : [ Tous ▾ ]         │
│                                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ img  │ │ img  │ │ 🎬   │ │ img  │ │ img  │ │  +   │ │
│  │ Libre│ │200🪙 │ │ Abo  │ │ Libre│ │350🪙 │ │Upload│ │
│  │ ✏️ 🗑│ │ ✏️ 🗑│ │ ✏️ 🗑│ │ ✏️ 🗑│ │ ✏️ 🗑│ │      │ │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │
└──────────────────────────────────────────────────────────┘
```

#### `CreateGalleryModal`

```
Nom de la galerie     [ Pack Intense                ]
Description           [ Soirée hot complète...      ]
Image de couverture   [ Upload / choisir depuis médias ]
Visibilité            ○ Payante (🪙) ○ Abonnés ○ Gratuite
Prix (si payante)     [ 800 ] 🪙
Ajouter des médias    → ouvre MediaPickerGrid
```

#### `UploadMediaModal`

```
[ Zone drag & drop — glissez vos fichiers ici ]
  ou [ Parcourir ]

Fichiers sélectionnés :
  photo_01.jpg  ✅
  photo_02.jpg  ✅
  video_01.mp4  ✅ (max 500MB)

Pour chaque fichier :
  Visibilité : ○ Gratuit ○ [ 200 ] 🪙 ○ Abonnés

  Description (optionnel, uniquement médias hors galerie)
  [ Soirée d'été... ]

[ Annuler ]                      [ ⬆️ Uploader ]
```

#### `EditMediaModal`

```
Aperçu du média (preview)
Visibilité   ○ Gratuit ○ Payant [ 200 ]🪙 ○ Abonnés
Description  [ ...                              ]
             [ 🗑 Supprimer ce média ]
```

#### `EditGalleryModal`

Mêmes champs que Create + gestion des médias à l'intérieur (drag pour réordonner, supprimer)

---

### 3.3 MessagesPage `/messages`

#### Layout 3 colonnes

```
┌───────────┬────────────────────────────────┬──────────────┐
│ SIDEBAR   │        CONVERSATION            │  LISTE       │
│ GAUCHE    │                                │  CLIENTS     │
│ (nav)     │                                │  (sidebar    │
│           │  ┌─ Header client ───────────┐ │   droite)    │
│           │  │ [Avatar] MaxV  · En ligne  │ │              │
│           │  │ Abonné Plus 💎  · 1200🪙   │ │  Filtres :   │
│           │  │ [ 📋 Infos ] [ 📝 Notes ]  │ │  [Tous    ▾] │
│           │  └───────────────────────────┘ │              │
│           │                                │  ┌──────────┐│
│           │  ── Messages ────────────────  │  │MaxV  ⭐  ││
│           │                                │  │il y a 2m ││
│           │  MaxV : Bonjour ! 😍           │  │Salut !   ││
│           │  ── 10:30 ──                   │  └──────────┘│
│           │                                │  ┌──────────┐│
│           │  Luna : Merci beaucoup ! 💕     │  │alex_94   ││
│           │  ── 10:32 ──                   │  │il y a 5m ││
│           │                                │  │Coucou    ││
│           │                                │  └──────────┘│
│           │  ─────────────────────────── │  ┌──────────┐│
│           │  [ Écrire...           ] [▶] │  │Sophie_K  ││
│           │  [ 📸 ] [ 🎁 ] [ ⚡ Auto ]   │  │il y a 8m ││
│           │                                │  └──────────┘│
└───────────┴────────────────────────────────┴──────────────┘
```

#### Header client (en haut de la conversation)

```
┌──────────────────────────────────────────────────────┐
│  [Avatar]  MaxV                       · 🟢 En ligne  │
│            Abonné Plus 💎  ·  Depuis 3 mois          │
│            1 200🪙 envoyés au total                   │
│                                                      │
│  [ 📋 Voir infos ] [ 📝 Notes ]  [ 🚫 Bloquer ]      │
└──────────────────────────────────────────────────────┘
```

- **Voir infos** → ouvre `ClientInfoDrawer` (slide depuis la droite) avec tout l'historique
- **Notes** → ouvre `ClientNotesModal` — zone de texte privée (jamais visible par le client)

#### ClientInfoDrawer

```
MaxV — Profil client
─────────────────────
Abonnement   : Plus 💎
Depuis       : 3 mois
Total dépensé: 1 200🪙
Nb messages  : 42
Tips envoyés : 8 (total 600🪙)
Packs achetés: Pack Intense, Pack Cosplay
Dernier actif: il y a 2 min

Historique des achats :
• Pack Intense     800🪙  il y a 1 mois
• Tip 200🪙              il y a 2 semaines
• Tip 100🪙              il y a 1 semaine
```

#### Switch client (l'expérience clé)

La conversation s'affiche comme une **card** — on peut switcher sans perdre le contexte.

**Sur desktop :**

- `Tab` ou `→` → client suivant dans la liste filtrée
- `←` → client précédent
- `Ctrl + 1-9` → aller directement au client N° de la liste

**Sur mobile :**

- Swipe gauche/droite sur la conversation pour changer de client

**Indicateur visuel :**

```
← MaxV   [2/8 non lus]   alex_94 →
```

Flèches gauche/droite en haut de la card pour switcher manuellement

#### Filtres sidebar droite

| Filtre          | Description                            |
| --------------- | -------------------------------------- |
| Tous            | Tous les clients                       |
| Non lus         | Messages non lus en premier            |
| Abonnés Plus 💎 | Abonnés plan Plus uniquement           |
| Abonnés Normal  | Plan Normal                            |
| Payants         | Ont payé pour écrire (sans abonnement) |
| Récents         | Dernier message < 1h                   |
| VIP             | Clients marqués manuellement comme VIP |

---

### 3.4 DemandesPage `/requests`

```
┌──────────────────────────────────────────────────────────┐
│  Demandes Spéciales                                      │
│                                                          │
│  [ ⏳ En attente (3) ] [ ✅ Acceptées ] [ ❌ Refusées ]  │
│                                                          │
│  ── En attente ────────────────────────────────────────  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  [Avatar] MaxV  · Abonné Plus · il y a 5 min    │    │
│  │  ──────────────────────────────────────────     │    │
│  │  🔥 Scène hot + jouet                           │    │
│  │  "J'aimerais une session de 30min ce soir"      │    │
│  │                                   1 200 🪙      │    │
│  │                                                 │    │
│  │  [ ❌ Refuser ]          [ ✅ Accepter ]         │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  [Avatar] alex_94 · Non abonné · il y a 12 min  │    │
│  │  ──────────────────────────────────────────     │    │
│  │  📞 Appel Privé 15 min                          │    │
│  │  (aucun message joint)                          │    │
│  │                                     400 🪙      │    │
│  │                                                 │    │
│  │  [ ❌ Refuser ]          [ ✅ Accepter ]         │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

**AcceptRequestModal**

```
Tu acceptes la demande de MaxV

Type    : 🔥 Scène hot + jouet
Prix    : 1 200 🪙 (débités immédiatement)
Message : "J'aimerais une session ce soir"

Un message automatique sera envoyé à MaxV
pour lui confirmer et planifier.

[ Annuler ]            [ ✅ Confirmer & encaisser ]
```

---

### 3.5 SettingsPage `/settings`

**5 sections de configuration :**

#### 1. 💬 Messages automatiques

Réponses déclenchées automatiquement.

| Déclencheur                  | Exemple de message                                     |
| ---------------------------- | ------------------------------------------------------ |
| Nouveau message (hors ligne) | "Je suis indispo pour le moment, je reviens vite ! 💕" |
| Nouveau abonné               | "Bienvenue ! 🌸 Tu as accès à ma galerie privée..."    |
| Anniversaire 1 mois          | "Déjà 1 mois ensemble ! Merci pour ton soutien 💜"     |
| Inactivité 7 jours           | "Tu me manques ! 😘 Voici quelque chose pour toi..."   |
| Après un tip                 | "Merci pour ton tip ! ça me touche vraiment 🥰"        |

Chaque message auto peut avoir :

- Un **délai** avant envoi (immédiat / 5min / 1h)
- Un **média joint** optionnel
- Un état actif/inactif (toggle)

#### 2. 🔥 Demandes spéciales configurables

Définir quelles demandes les clients peuvent faire :

- Activer/désactiver chaque type de show
- Titre personnalisé (ex : "Scène hot" → tu peux renommer)
- Description de ce que tu feras
- Prix en 🪙
- Durée estimée
- Disponibilité : toujours / sur demande / désactivé

#### 3. 🔔 Notifications

Toggle pour chaque type :

- Nouveau message reçu
- Nouveau abonné
- Tip reçu
- Demande spéciale
- Objectif live atteint
- Contenu débloqué
- Sons activés/désactivés

#### 4. 🔒 Confidentialité & Accès

- **Pays bloqués** — liste des pays où le profil est invisible
- **Liste noire** — clients bloqués (avec date et raison)
- **Profil visible** — toggle pour mettre le profil en pause
- **Mode vacances** — message automatique + profil grisé

#### 5. 💰 Paiements & Retrait

- IBAN enregistré (masqué, modifiable)
- Seuil de retrait automatique (ex: retrait auto à 500€)
- Historique des virements reçus
- Taux de commission plateforme affiché clairement
- Demande de retrait manuel

---

## 4. Modals récapitulatif complet

| Modal                | Page            | Rôle                                        |
| -------------------- | --------------- | ------------------------------------------- |
| `CropModal`          | Profil          | Recadrer photo profil ou couverture         |
| `CreateGalleryModal` | Médias          | Créer une galerie avec médias + prix        |
| `EditGalleryModal`   | Médias          | Modifier galerie + gérer médias internes    |
| `UploadMediaModal`   | Médias          | Upload drag&drop + visibilité + description |
| `EditMediaModal`     | Médias          | Modifier visibilité/prix/description        |
| `MediaPickerGrid`    | Médias/Messages | Sélectionner médias depuis sa galerie       |
| `ClientInfoDrawer`   | Messages        | Slide panel avec tout l'historique client   |
| `ClientNotesModal`   | Messages        | Notes privées sur un client                 |
| `AcceptRequestModal` | Demandes        | Confirmer + encaisser une demande           |
| `RefuseRequestModal` | Demandes        | Refuser avec message optionnel              |
| `AutoMessageModal`   | Settings        | Créer/éditer un message automatique         |
| `CreateShowModal`    | Settings        | Créer un nouveau type de demande spéciale   |
| `WithdrawModal`      | Settings        | Demande de retrait                          |
| `BlockCountryModal`  | Settings        | Ajouter un pays à la liste noire            |

---

## 5. Raccourcis clavier (MessagesPage desktop)

| Raccourci          | Action                        |
| ------------------ | ----------------------------- |
| `Tab` ou `→`       | Client suivant                |
| `Shift+Tab` ou `←` | Client précédent              |
| `Ctrl + 1-9`       | Aller au client N°            |
| `Ctrl + Enter`     | Envoyer le message            |
| `Ctrl + M`         | Ouvrir MediaPickerGrid        |
| `Ctrl + N`         | Ouvrir Notes client           |
| `Escape`           | Fermer le drawer/modal ouvert |
