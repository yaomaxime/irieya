# Connexion au backend Irieya

Le frontend Vite utilise le backend Flask existant via les routes suivantes :

- `POST /login`
- `POST /signup`
- `POST /verify-token`
- `GET /profile`
- `PUT /profile`

En développement, l’URL par défaut est `http://localhost:5000`.

Pour le backend actuellement déployé, la configuration de production est :

```bash
VITE_API_URL=https://irieya.onrender.com
```

Vous pouvez aussi créer `frontend/.env` avec cette variable avant de lancer le projet.

Le backend doit accepter l’origine du frontend dans sa configuration CORS. L’application propose
également un mode découverte sans compte ; les préférences et la progression sont alors conservées
uniquement dans le navigateur.
