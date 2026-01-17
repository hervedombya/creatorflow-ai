# Plan d'Implémentation : CreatorFlow AI (Spécial Hackathon 9h)

## 🎯 Objectif
Lancer un MVP d'une plateforme SaaS qui génère du contenu marketing personnalisé (Texte + Image) en analysant le style unique du créateur.

## 🛠 Stack Technique

### Frontend (L'expérience "Lovable")
-   **Framework** : Next.js 14 (App Router)
-   **Styling** : Tailwind CSS + Shadcn/UI
-   **Hébergement** : Vercel

### Backend (Le "Cerveau")
-   **API** : **Python (FastAPI)**
-   **Database** : **Supabase**
-   **Hébergement** : Render / Railway

### Intelligence Artificielle
-   **Texte** : **Featherless.ai** (Mistral/Llama)
-   **Image** : **Replicate** (Flux/SDXL) ou **OpenAI** (DALL-E 3)

## 🏗 Architecture

```mermaid
graph TD
    User["Utilisateur"] -- Request --> FE["Frontend (Next.js)"]
    FE -- Auth/Data --> DB["Supabase"]
    
    subgraph BACKEND ["Backend Python (FastAPI)"]
        FE -- POST /generate --> API["FastAPI Controller"]
        API -- 1. Analyse --> LLM["Featherless (LLM)"]
        API -- 2. Logic --> ENG["Prompt Engine"]
        ENG -- 3. Text Gen --> LLM
        ENG -- 4. Image Gen --> IMG["Image API (Replicate)"]
    end
    
    API -- Result JSON --> FE
    FE -- Display --> User
```

## 📋 Plan de Développement (9 Heures)

| Phase | Horaire (H) | Tâches Clés |
| :--- | :--- | :--- |
| **1. Fondations** | H 0 - 1.5 | • Init Repo Monorepo<br>• Setup Supabase & Auth<br>• Setup Shadcn/UI |
| **2. Backend Logic** | H 1.5 - 4.5 | • **Endpoint `/analyze`** : Pipeline Featherless<br>• **Endpoint `/generate`** : Chaîne de prompts<br>• Intégration Replicate/DALL-E |
| **3. Interface UI** | H 4.5 - 7.5 | • Dashboard "Style DNA"<br>• Formulaire "Quick Create"<br>• Grille de résultats |
| **4. Polish** | H 7.5 - 9.0 | • Loading states<br>• Déploiement |
