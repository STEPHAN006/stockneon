# Gestion de Stock

Application de gestion de stock développée avec Next.js 15, Tailwind CSS et shadcn/ui.

## 🚀 Fonctionnalités

- **Dashboard** : Vue d'ensemble avec statistiques et actions rapides
- **Inventaire** : Gestion des pièces avec recherche et filtrage
- **Stock Minimum** : Alertes automatiques quand le stock atteint le seuil minimum
- **Notifications** : Toast notifications et emails d'alerte (Resend)
- **Entrées/Sorties** : Enregistrement des mouvements de stock
- **Fournisseurs** : Gestion des fournisseurs avec statistiques
- **Techniciens** : Gestion des techniciens
- **Historique** : Consultation et export des mouvements (CSV, Excel, PDF)
- **Authentification** : Système de connexion simple

## 🛠️ Stack Technique

- **Frontend** : Next.js 15 (App Router), React 19, TypeScript
- **Styling** : Tailwind CSS, shadcn/ui
- **Base de données** : SQLite avec Prisma ORM
- **Package Manager** : pnpm

## 📦 Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd stock
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer la base de données**
   ```bash
   # Créer le fichier .env.local
   echo 'DATABASE_URL="file:./dev.db"' > .env.local
   ```

4. **Configuration des emails (optionnel)**
   ```bash
   # Ajouter à .env.local pour les alertes email
   echo 'RESEND_API_KEY="your_resend_api_key_here"' >> .env.local
   echo 'ADMIN_EMAIL="admin@yourdomain.com"' >> .env.local
   ```

5. **Initialiser la base de données**
   ```bash
   # Générer le client Prisma
   pnpm prisma generate
   
   # Appliquer les migrations
   pnpm db:migrate
   
   # Peupler avec des données de test
   pnpm db:seed
   ```

6. **Démarrer l'application**
   ```bash
   pnpm dev
   ```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🔐 Connexion

Utilisez les identifiants suivants pour vous connecter :
- **Email** : admin@test.com
- **Mot de passe** : admin123

## 📊 Données de Test

Le script de seed inclut :
- 3 fournisseurs
- 3 techniciens
- 5 pièces avec stock initial
- 5 entrées de stock
- 5 sorties de stock

## 🗂️ Structure du Projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # API Routes
│   ├── login/             # Page de connexion
│   ├── inventaire/        # Gestion des pièces
│   ├── entree/            # Nouvelle entrée
│   ├── sortie/            # Nouvelle sortie
│   ├── fournisseurs/      # Gestion fournisseurs
│   ├── techniciens/       # Gestion techniciens
│   └── historique/        # Historique des mouvements
├── components/            # Composants réutilisables
│   ├── ui/               # Composants shadcn/ui
│   ├── layout.tsx        # Layout principal
│   └── sidebar.tsx       # Barre latérale
└── lib/                  # Utilitaires
    ├── prisma.ts         # Client Prisma
    └── utils.ts          # Fonctions utilitaires
```

## 🚀 Scripts Disponibles

- `pnpm dev` : Démarrer le serveur de développement
- `pnpm build` : Construire l'application pour la production
- `pnpm start` : Démarrer l'application en production
- `pnpm db:migrate` : Appliquer les migrations de base de données
- `pnpm db:seed` : Peupler la base de données avec des données de test
- `pnpm db:reset` : Réinitialiser la base de données et la repeupler

## 🔧 Configuration

### Base de données
La base de données SQLite est stockée dans `prisma/dev.db`. Pour utiliser une autre base de données, modifiez la variable `DATABASE_URL` dans `.env.local`.

### Authentification
L'authentification est volontairement simplifiée pour cette démo. En production, utilisez une solution robuste comme NextAuth.js ou Auth0.

## 📝 API Endpoints

- `POST /api/auth/login` : Connexion
- `GET /api/inventory` : Liste des pièces
- `POST /api/inventory` : Créer une pièce
- `GET /api/inventory/[id]` : Détails d'une pièce
- `PUT /api/inventory/[id]` : Modifier une pièce
- `DELETE /api/inventory/[id]` : Supprimer une pièce
- `GET /api/entries` : Liste des entrées
- `POST /api/entries` : Créer une entrée
- `GET /api/exits` : Liste des sorties
- `POST /api/exits` : Créer une sortie
- `GET /api/suppliers` : Liste des fournisseurs
- `POST /api/suppliers` : Créer un fournisseur
- `GET /api/technicians` : Liste des techniciens
- `POST /api/technicians` : Créer un technicien
- `GET /api/history` : Historique des mouvements
- `GET /api/dashboard` : Statistiques du dashboard

## 🎨 Interface Utilisateur

L'interface utilise shadcn/ui pour des composants modernes et accessibles :
- Design responsive
- Mode sombre/clair
- Animations fluides
- Accessibilité optimisée

## 📱 Responsive Design

L'application est entièrement responsive et s'adapte à tous les écrans :
- Mobile (< 768px)
- Tablette (768px - 1024px)
- Desktop (> 1024px)

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connectez votre repository à Vercel
2. Configurez la variable d'environnement `DATABASE_URL`
3. Déployez automatiquement

### Autres plateformes
1. Construisez l'application : `pnpm build`
2. Démarrez en production : `pnpm start`
3. Configurez votre base de données de production

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
