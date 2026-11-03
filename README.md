# Iriéya

Iriéya contains the Expo mobile app, a Vite web frontend, and a Flask API that uses Firebase Authentication and Realtime Database.

## Project layout

- `App.js`, `screens/`, `components/`, and `assets/`: Expo app for Android and iOS
- `frontend/`: React and Vite website hosted by Firebase Hosting
- `backend/`: Flask API deployed separately (for example, on Render)

The mobile app and web frontend are separate packages because Expo uses React Native while the website uses React DOM. Both use the same backend.

## Run locally

Install the root and frontend dependencies once:

```sh
npm install
npm --prefix frontend install
```

Start the Expo app with `npm start`, or the website with `npm run web:dev`. The Vite frontend reads `VITE_API_URL` from `frontend/.env`; copy `frontend/.env.example` and set it to the backend URL. Local Vite requests use `http://localhost:5173`, which is included in the backend's default CORS origins.

Run the backend from `backend/` after creating its virtual environment and configuring `backend/.env`.

## Build and deploy the website

`npm run web:build` creates `frontend/dist`. `npm run web:deploy` builds that output and deploys it to Firebase Hosting. Configure `CORS_ALLOWED_ORIGINS` on the backend host to include the deployed Firebase Hosting origin.

## Environment files

- Root `.env`: Expo public configuration, including `EXPO_PUBLIC_API_URL`
- `frontend/.env`: Vite public configuration, including `VITE_API_URL`
- `backend/.env`: private backend and Firebase configuration; never commit this file
