# 📋 SPECIFICATIONS - MusicBox Application Musicale

**Version:** 1.0.0  
**Date de création:** Mars 2026  
**Statut:** En production  

---

## Table des Matières

1. [Vision et Objectifs](#vision-et-objectifs)
2. [Fonctionnalités Métier](#fonctionnalités-métier)
3. [Exigences Techniques](#exigences-techniques)
4. [Architecture](#architecture)
5. [Flux Utilisateur](#flux-utilisateur)
6. [Modèle de Données](#modèle-de-données)
7. [Interfaces Utilisateur](#interfaces-utilisateur)
8. [Comportement du Système](#comportement-du-système)
9. [Critères d'Acceptation](#critères-dacceptation)
10. [Calendrier de Développement](#calendrier-de-développement)

---

## Vision et Objectifs

### Vision
Créer une application web de découverte musicale moderne, intuitive et performante qui permet aux utilisateurs d'explorer librement le catalogue massif de Deezer et de gérer leurs favoris personnels.

### Objectifs Principaux
1. **Accessibilité:** Fournir une interface facile d'accès sans authentification
2. **Découverte:** Permettre des recherches flexibles et multi-catégories
3. **Engagement:** Offrir une expérience de lecture audio directe
4. **Persistance:** Sauvegarder les préférences utilisateur localement
5. **Performance:** Assurer une application rapide et réactive
6. **Responsive:** Fonctionner sur tous les appareils (desktop, mobile, tablette)

---

## Fonctionnalités Métier

### FR-001: Recherche Multi-Catégories
**Description:** L'utilisateur peut rechercher du contenu musical par catégorie

**Catégories Supportées:**
- Titres (Pistes musicales)
- Artistes
- Albums
- Playlists

**Critères d'Acceptation:**
- La recherche renvoie jusqu'à 50 résultats
- Le filtre de catégorie change les résultats correctement
- Les résultats incluent: titre, artiste, image de couverture
- Message d'erreur approprié si aucun résultat

### FR-002: Lecture d'Aperçu Audio
**Description:** L'utilisateur peut écouter un aperçu audio (30 secondes) d'une chanson

**Fonctionnalités:**
- Bouton Play/Pause
- Barre de progression
- Contrôle du volume
- Affichage des infos du titre en cours

**Critères d'Acceptation:**
- L'audio se lance au clic sur "Écouter"
- La barre progresse avec la lecture
- Le pause fonctionne correctement
- L'écran du lecteur se met à jour

### FR-003: Gestion des Favoris
**Description:** L'utilisateur peut marquer des éléments comme favoris et les retrouver

**Fonctionnalités:**
- Ajouter/supprimer un élément en favori
- Sauvegarde persistante via localStorage
- Affichage dédié des favoris
- Suppression rapide depuis la liste

**Critères d'Acceptation:**
- Le bouton ❤ change d'état (rouge/gris)
- Les favoris persistent après rechargement
- Maximum ~1000 favoris possible (limite localStorage)
- Suppression instantanée de la liste

### FR-004: Affichage Responsive
**Description:** L'interface s'adapte à tous les tailles d'écran

**Points de Rupture:**
- Desktop: 1200px+
- Tablette: 768px - 1199px
- Mobile: < 768px

**Critères d'Acceptation:**
- Tous les éléments restent visibles et utilisables
- Pas de scroll horizontal inutile
- Texte lisible sur tous les écrans
- Boutons tactiles > 50px sur mobile

---

## Exigences Techniques

### TR-001: Technologies Requises
```
Frontend:
  - HTML5 (structure sémantique)
  - CSS3 (Grid, Flexbox, Animations)
  - JavaScript ES6+ (async/await, fetch API)

API:
  - Deezer REST API v2.0 (publique, sans authentification)

Stockage:
  - Browser LocalStorage (5-10 MB par domaine)

Navigateurs Supportés:
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
```

### TR-002: Performance
```
Temps de Chargement:
  - Page initiale: < 2 secondes
  - Recherche: < 1 secondes (API délai compris)
  - Affichage des résultats: < 500ms

Optimisations:
  - CSS et JavaScript minifiés
  - Images optimisées avec fallbacks
  - Lazy loading des images
  - Requêtes API minimales
```

### TR-003: Sécurité
```
Mesures:
  - Validation des entrées utilisateur
  - Encodage URI pour les requêtes API
  - Pas de stockage de données sensibles
  - HTTPS obligatoire en production
  - Protection contre les injections XSS via textContent
```

### TR-004: Accessibilité
```
Standards WCAG 2.1 Niveau AA:
  - Contraste de couleurs: 4.5:1 minimum
  - Tailles de police: 14px minimum
  - Focus visible pour la navigation clavier
  - Attributs alt pour toutes les images
  - Labels pour tous les inputs
```

---

## Architecture

### Architecture Globale

```
┌─────────────────────────────────────┐
│     UTILISATEUR (Navigateur)        │
├─────────────────────────────────────┤
│       Interface Web (index.html)    │
│  ┌──────────────┬──────────────┐   │
│  │  Styles.css  │  Script.js   │   │
│  └──────────────┴──────────────┘   │
├─────────────────────────────────────┤
│    localStorage (Favoris)           │
├─────────────────────────────────────┤
│    Fetch API (Requêtes HTTP)        │
└──────────────────┬──────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Deezer API (Cloud)  │
        │   /search/*          │
        │   /artist/*          │
        │   /album/*           │
        │   /playlist/*        │
        └──────────────────────┘
```

### Architecture Logicielle

```
script.js
├── Configuration
│   ├── DEEZER_API_BASE = 'https://api.deezer.com'
│   └── DEEZER_API_LIMIT = 50
│
├── État Global (appState)
│   ├── currentFilter
│   ├── searchQuery
│   ├── favorites[]
│   ├── currentTrack
│   ├── isPlaying
│   └── audioElement
│
├── Module Recherche
│   ├── performSearch()
│   ├── fetchResults()
│   ├── buildDeezerEndpoint()
│   ├── displayResults()
│   └── createResultCard()
│
├── Module Lecteur Audio
│   ├── handlePlay()
│   ├── playTrackItem()
│   ├── updatePlayerDisplay()
│   ├── playPreview()
│   ├── playTrack()
│   ├── pauseTrack()
│   ├── toggleVolume()
│   ├── updateProgress()
│   └── [Audio events]
│
├── Module Favoris
│   ├── handleToggleFavorite()
│   ├── renderFavorites()
│   ├── removeFavorite()
│   └── [localStorage sync]
│
├── Module Filtres
│   ├── changeFilter()
│   └── [Event listeners]
│
└── Module Utilitaires
    ├── showLoading()
    ├── showError()
    ├── clearError()
    └── [Console logging]
```

---

## Flux Utilisateur

### Flux 1: Recherche et Affichage des Résultats

```
START
  │
  ▼
Utilisateur saisit une requête
  │
  ▼
Clic sur "Rechercher" (ou Entrée)
  │
  ▼
performSearch()
  │
  ├─► Valider la requête (non vide)
  │
  ├─► Afficher spinner de chargement
  │
  └─► fetchResults(query, filterType)
      │
      ├─► Construire l'endpoint API
      │
      ├─► Fetch HTTP GET
      │
      ├─► Traiter la réponse JSON
      │
      ├─► displayResults(data)
      │   │
      │   └─► Créer 50 cartes (createResultCard)
      │
      └─► Masquer le spinner
           │
           ▼
      Résultats affichés
  │
  ▼
END
```

### Flux 2: Lecture d'un Aperçu Audio

```
START
  │
  ▼
Utilisateur clique "▶ Écouter"
  │
  ▼
handlePlay(item, type)
  │
  ├─ Si type = "track"
  │  └─► playTrackItem(item)
  │
  ├─ Si type = "artist"
  │  └─► fetchArtistTopTracks() → playTrackItem()
  │
  ├─ Si type = "album"
  │  └─► fetchAlbumTracks() → playTrackItem()
  │
  └─ Si type = "playlist"
     └─► fetchPlaylistTracks() → playTrackItem()
       │
       └─► updatePlayerDisplay()
           │
           └─► playPreview()
               │
               ├─► Créer Audio element
               │
               ├─► Charger preview URL
               │
               ├─► Démarrer la lecture
               │
               ├─► Events: timeupdate, ended
               │
               └─► updateProgress()
  │
  ▼
END
```

### Flux 3: Gestion des Favoris

```
START
  │
  ▼
Utilisateur clique sur ❤
  │
  ▼
handleToggleFavorite(id, title, artist, image)
  │
  ├─ Chercher l'ID dans appState.favorites
  │
  ├─ SI trouvé
  │  └─► Supprimer de la liste
  │      │
  │      └─► Retirer classe "liked" du bouton
  │
  └─ SI non trouvé
     └─► Ajouter à la liste
         │
         └─► Ajouter classe "liked" au bouton
       │
       ▼
  Sauvegarder dans localStorage
  │
  └─► Rafraîchir l'affichage (renderFavorites)
      │
      ▼
END
```

---

## Modèle de Données

### Objet appState
```javascript
{
  currentFilter: string,      // 'track' | 'artist' | 'album' | 'playlist'
  searchQuery: string,        // Dernier terme recherché
  favorites: Array[],         // Éléments en favori
  currentTrack: {             // Titre en cours de lecture
    id: number,
    title: string,
    artist: string,
    cover: string,            // URL de l'image
    preview: string,          // URL de l'aperçu audio
    duration: number          // En secondes
  },
  isPlaying: boolean,         // État de la lecture
  audioElement: HTMLAudioElement // Référence l'élément audio
}
```

### Objet Favori
```javascript
{
  id: number,                 // ID Deezer unique
  title: string,              // Nom du titre/artiste/album
  artist: string,             // Nom de l'artiste
  image: string               // URL de la couverture
}
```

### Réponse API Deezer
```javascript
{
  data: Array[
    {
      id: number,
      title: string,
      duration: number,
      preview: string,        // URL aperçu (null si non dispo)
      artist: {
        id: number,
        name: string
      },
      album: {
        id: number,
        title: string,
        cover_medium: string   // URL de l'image
      }
    }
  ]
}
```

### Données localStorage
```javascript
// Clé: 'musicbox_favorites'
// Valeur: JSON stringifié
[
  {
    id: 3135556,
    title: "Bohemian Rhapsody",
    artist: "Queen",
    image: "https://..."
  },
  ...
]
```

---

## Interfaces Utilisateur

### UI-001: Écran Principal (Desktop)

```
┌────────────────────────────────────────────┐
│            🎵 MusicBox                     │
│      Explorez la musique avec Deezer       │
├────────────────────────────────────────────┤
│ [Champs de recherche.....................] │
│                      [Rechercher]          │
├────────────────────────────────────────────┤
│ [Titres][Artistes][Albums][Playlists]     │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │          │  │          │  │          │ │
│  │  Album   │  │  Album   │  │  Album   │ │
│  │  Titre   │  │  Titre   │  │  Titre   │ │
│  │  Artiste │  │  Artiste │  │  Artiste │ │
│  │ [Play]❤ │  │ [Play]❤  │  │ [Play]❤  │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                            │
│  (Grille dynamique de 50 résultats)        │
├────────────────────────────────────────────┤
│  [Image] │ Titre de la Chanson              │
│          │ Artiste                          │
│  Album   │ [Play] [Pause] [Volume]          │
│          │ [████████░░░░░░░░░░]             │
├────────────────────────────────────────────┤
│  ❤️ Mes Favoris                            │
│  ┌──────┐  ┌──────┐  ┌──────┐  ...         │
│  │Image │  │Image │  │Image │              │
│  │Titre │  │Titre │  │Titre │              │
│  │Artist│  │Artist│  │Artist│              │
│  └──────┘  └──────┘  └──────┘              │
└────────────────────────────────────────────┘
```

### UI-002: Écran Mobile

```
┌──────────────────┐
│  🎵 MusicBox     │
│   Explorez...    │
├──────────────────┤
│ [Recherche....] │
│   [Chercher]    │
├──────────────────┤
│ [T][A][Al][P]   │
├──────────────────┤
│ ┌────────────┐   │
│ │   Image    │   │
│ │  Titre     │   │
│ │  Artiste   │   │
│ │[Play] ❤   │   │
│ └────────────┘   │
│ ┌────────────┐   │
│ │   Image    │   │
│ │  Titre     │   │
│ │  Artiste   │   │
│ │[Play] ❤   │   │
│ └────────────┘   │
├──────────────────┤
│ ❤️ Mes Favoris   │
│ ┌────┐┌────┐     │
│ │Img ││Img │     │
│ │Tit ││Tit │     │
│ │Art ││Art │     │
│ └────┘└────┘     │
└──────────────────┘
```

---

## Comportement du Système

### SC-001: Gestion des Erreurs

**Erreur API / Connexion:**
- Message: "Erreur lors de la recherche: [détails]"
- Durée affichage: 5 secondes
- Fallback: Afficher le dernier résultat cache (futur)

**Aucun résultat:**
- Message: "Aucun résultat trouvé pour '[requête]'"
- Solution: Suggérer d'autres termes de recherche

**Aperçu non disponible:**
- Message: "Aperçu audio non disponible pour ce titre"
- Raison: Restrictions de droits d'auteur ou régionales

**LocalStorage désactivé:**
- Les favoris ne seront pas sauvegardés
- Message optionnel: "Aktivez le stockage pour sauvegarder les favoris"

### SC-002: Gestion de l'État

**État appState:**
- Persisté partiellement (favorites uniquement)
- Réinitialisé à chaque rechargement de page
- Synchronisé avec localStorage

**Multionglet:**
- Pas de synchronisation entre onglets (défaut)
- Besoin: Implémenter storage event pour v1.1

### SC-003: Performance

**Chargement des images:**
- Images progressives avec fallbacks placeholder
- Fallback: "https://via.placeholder.com/150"

**Requêtes API:**
- Rate limiting ~50 req/IP/minute
- Pas de caching côté client (futur)
- Timeout: 10 secondes

**Animations:**
- 60 FPS avec CSS (pas JavaScript)
- Transition: 0.3s ease par défaut

---

## Critères d'Acceptation

### CA-001: Recherche Fonctionnelle
- [ ] L'utilisateur peut entrer un terme de recherche
- [ ] Les 4 filtres changent le type de résultat
- [ ] 50 résultats affichés maximum
- [ ] Chaque carte affiche: image, titre, artiste
- [ ] Les boutons play/cœur sont fonctionnels

### CA-002: Lecture Audio
- [ ] Les aperçus de 30s jouent au clic Play
- [ ] La pause arrête la lecture
- [ ] La barre de progression se met à jour
- [ ] Le volume fonctionne
- [ ] Les infos du lecteur se mettent à jour

### CA-003: Gestion des Favoris
- [ ] Clic ❤ ajoute/retire des favoris
- [ ] Les favoris persistent après rechargement
- [ ] La section Favoris affiche la liste
- [ ] Suppression rapide depuis Favoris
- [ ] Le bouton ❤ change de couleur

### CA-004: Interface
- [ ] Responsive sur mobile/tablette/desktop
- [ ] Tous les boutons sont cliquables (>50px)
- [ ] Pas de scroll horizontal inutile
- [ ] Design moderne et cohérent
- [ ] Animations fluides

### CA-005: Fiabilité
- [ ] Pas de crash JavaScript
- [ ] Messages d'erreur explicites
- [ ] Récupération gracieuse des erreurs
- [ ] localStorage ne ralentit pas l'app

---

## Calendrier de Développement

### Phase 1: Planification (Semaine 1)
- [x] Définir les objectifs
- [x] Concevoir les wireframes
- [x] Rédiger les spécifications
- [x] Préparer l'architecture

**Livrable:** Ce document

### Phase 2: Développement Frontend (Semaine 2)
- [x] Structure HTML
- [x] Styling CSS (desktop + responsive)
- [x] Configuration de base JavaScript

**Livrable:** index.html, styles.css, script.js de base

### Phase 3: Intégration API (Semaine 2)
- [x] Implémentation du module recherche
- [x] Création des endpoints de requête
- [x] Affichage des résultats
- [x] Gestion des erreurs

**Livrable:** Recherche fonctionnelle

### Phase 4: Lecteur Audio (Semaine 3)
- [x] Intégration Web Audio API
- [x] Contrôles play/pause/volume
- [x] Barre de progression
- [x] Affichage des infos

**Livrable:** Lecteur fonctionnel

### Phase 5: Gestion des Favoris (Semaine 3)
- [x] Implémentation localStorage
- [x] Interface d'ajout/suppression
- [x] Affichage des favoris
- [x] Persistance des données

**Livrable:** Système de favoris

### Phase 6: Polish & Testing (Semaine 4)
- [x] Tests manuels complets
- [x] Optimisation des performances
- [x] Corrections de bugs
- [x] Responsive design ajustements

**Livrable:** Application v1.0 finale

### Phase 7: Documentation (Semaine 4)
- [x] README.md complet
- [x] Ce document de spécifications
- [x] Guides utilisateur
- [x] Code comments

**Livrable:** Documentation complète

---

## Métriques de Succès

| Métrique | Cible | Statut |
|----------|-------|--------|
| Temps chargement page | < 2s | ✅ |
| Temps recherche | < 1s | ✅ |
| Taux d'erreur API | < 1% | ✅ |
| Support navigateurs | 4+ | ✅ |
| Responsive | Tous écrans | ✅ |
| Favoris persistants | 24h+ | ✅ |
| SEO Score | > 90 | ⚠️ |
| Accessibilité (a11y) | AA | ✅ |

---

## Limitations et Contraintes

### Limitations Techniques
1. **API Deezer:** Sans authentification, accès limité à 50 résultats
2. **Aperçus audio:** Limités à 30 secondes, non modifiables
3. **Streaming complet:** Non possible sans compte Deezer premium
4. **localStorage:** Limite ~5MB par domaine, mono-device
5. **Images:** Qualité dépendante de Deezer

### Contraintes Métier
1. **Pas de monétisation:** Application gratuite, open-source
2. **Dépendance API:** Fonctionne uniquement avec Deezer actif
3. **Pas de sauvegarde cloud:** Données locales uniquement
4. **Pas de partage:** Favoris non partageable (local)

### Contraintes Légales
1. **Droits d'auteur:** Respecter les conditions d'usage Deezer
2. **RGPD:** Pas de données personnelles stockées
3. **Licence:** MIT, open-source

---

## Évolutions Futures

### v1.1
- [ ] Authentification Deezer OAuth2
- [ ] Playlists personnalisées
- [ ] Historique de recherche
- [ ] Partage sur réseaux sociaux
- [ ] Multi-langue (i18n)

### v2.0
- [ ] Application mobile native (React Native)
- [ ] Synchronisation cloud des favoris
- [ ] Service Worker (mode offline)
- [ ] Recommandations IA
- [ ] Visualiseur audio (Web Audio API)
- [ ] Dark/Light mode toggle

### v3.0
- [ ] Abonnement premium
- [ ] Intégration sociale (amis, suivre)
- [ ] Radio personnalisée
- [ ] Recherche vocale

---

## Conclusion

MusicBox v1.0 est une application musicale fonctionnelle et moderne qui offre une expérience utilisateur fluide pour découvrir et écouter de la musique via l'API Deezer. 

L'architecture est scalable, le code est bien organisé, et les futures évolutions seront faciles à implémenter.

**Date de production:** Mars 2026  
**Statut:** ✅ Prêt pour production

---

**Document rédigé par:** Équipe de Développement GOMYCODE  
**Approuvé par:** Responsable Technique  
**Dernière mise à jour:** 8 Mars 2026
