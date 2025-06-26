
# CampusLink: Your AI-Powered Campus Hub

Welcome to the CampusLink developer guide! This document provides all the necessary instructions to get the project up and running on your local machine for development and contribution.

CampusLink is a modern, all-in-one platform designed to streamline student life. It combines essential campus services into a single, easy-to-use application, enhanced with intelligent AI features.

**Tech Stack:** Next.js, React, Tailwind CSS, ShadCN UI, Firebase (Auth, Firestore, App Hosting), and Genkit (for Google Gemini AI).

---

## 🚀 Getting Started

Follow these steps to set up the project on your local machine.

### 1. Prerequisites

Make sure you have the following software installed:
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Firebase CLI](https://firebase.google.com/docs/cli#install-cli-mac-linux):
  ```bash
  npm install -g firebase-tools
  ```

### 2. Clone the Repository

Clone the project to your local machine:
```bash
git clone <repository-url>
cd campushub
```

### 3. Install Dependencies

Install the required npm packages:
```bash
npm install
```

### 4. Firebase Setup

This project is tightly integrated with Firebase.

1.  **Login to Firebase**:
    ```bash
    firebase login
    ```
2.  **Initialize Firebase in your project**: If it's not already configured, you might need to associate your local project with your Firebase project.
    ```bash
    firebase use --add
    ```
    And select the `campus-link-42f69` project when prompted.

### 5. Environment Variables

The application requires environment variables for both Firebase and the Gemini AI API.

1.  **Create the environment file**: In the root of the project, create a file named `.env.local`.

2.  **Add Firebase Keys**: Go to your [Firebase Project Settings](https://console.firebase.google.com/project/campus-link-42f69/settings/general) and under "Your apps", find your web app. Click the "SDK setup and configuration" and select "Config". Copy the key-value pairs into your `.env.local` file like this:

    ```plaintext
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
    ```

3.  **Add Gemini API Key**:
    - Go to the [Google AI Studio](https://aistudio.google.com/app/apikey) to create an API key for the Gemini API.
    - Add this key to your `.env.local` file:
    ```plaintext
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

    Your final `.env.local` file should look similar to the example above, but with your actual keys.

---

## 🛠️ Running the App Locally

To run the full application with all features, you need to run both the Next.js development server and the Firebase emulators.

### Step 1: Start the Firebase Emulators

The emulators create a local environment that mimics Firebase services (Auth and Firestore). This allows you to develop without affecting live production data.

In a new terminal window, run:
```bash
firebase emulators:start
```
This will start the emulators and provide you with a link to the Emulator Suite UI, which is very helpful for viewing the local database and authenticated users.

### Step 2: Run the Next.js App

In another terminal window, run:
```bash
npm run dev
```
This command starts the Next.js development server, which automatically connects to the running Firebase emulators. You can now open your browser to `http://localhost:3000` to see the application.

---

## 🤖 AI Features

The app uses Genkit and the Gemini API for its intelligent features:

- **🛍️ AI Description Writer**: In the marketplace, generates compelling item descriptions from a title and category.
- **🧠 AI Tagger & Categorizer**: In the marketplace, suggests relevant categories and tags based on an item's title and description.
- **🔎 AI Lost & Found Matcher**: When a user reports a lost item, the AI instantly scans the 'found' items database for plausible matches.

**Important**: For the AI features to work, you must have a valid `GEMINI_API_KEY` in your `.env.local` file. You also may need to enable the "Google AI Platform" (or Vertex AI) API in your Google Cloud project associated with your Firebase project.

---

## 🚀 Deployment

The application is configured to deploy to **Firebase App Hosting**.

### Blaze Plan Required

**Crucially, to deploy this application and use its live AI features, your Firebase project must be on the Blaze (pay-as-you-go) plan.** This is required to allow the server-side code (Genkit flows) to make calls to the external Gemini API. The free "Spark" plan does not permit this.

### Deploying the App

Once you've upgraded to the Blaze plan, deploying is a single command:
```bash
firebase deploy --only hosting
```
This will build and deploy your Next.js application to Firebase App Hosting. The command will output the live URL upon completion.
