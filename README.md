# rateme.pics

![screenshot-placeholder](public/readme.png)

**rateme.pics** is a lightweight, just-for-fun web experiment inspired by Mark Zuckerberg's original FaceMash. Users upload photos and vote between pairs to determine which image looks better. It’s a social experiment in digital aesthetics and perception—built purely for entertainment and curiosity.

---

## 🛠 Tech Stack

* **Next.js** – Handles the React frontend and server-side API routes.
* **TypeScript** – Enables type-safe development across the full stack.
* **Prisma** – ORM used to manage and query a **PostgreSQL** database storing:

  * User profiles
  * Image metadata
  * Elo-based ratings
* **Clerk** – Simplifies user authentication via email or OAuth providers.

  * Automatically handles user login, logout, and sessions.
  * **Webhooks** sync Clerk user events with the Prisma database:

    * On sign-up: creates a corresponding Prisma user.
    * On delete: cleans up associated user data.
* **Vercel Blob Storage** – Used for image uploads and hosting.

  * When users upload an image, a blob is created and metadata is synced to Prisma.
  * Images are served globally via Vercel’s edge network for fast loading.

---

## 🔐 Authentication Flow

1. Users log in or sign up using Clerk.
2. Clerk triggers **webhooks** to keep user data in sync with the Prisma database.
3. All app actions (image uploads, ratings, etc.) are linked to an authenticated user.
4. Client-side Clerk SDK simplifies session management and gating access.

---

## 🖼 Image Upload & Storage

* Users can upload a photo directly through the site interface.
* Uploaded images are stored in **Vercel Blob Storage**, with metadata like:

  * Blob URL
  * Associated user ID
  * Timestamp
* This metadata is stored in the database using **Prisma** and synced automatically.

---

## 📊 How the Rating System Works

The main interaction on **rateme.pics** is selecting the better photo out of a randomly paired set of two.

### 🧠 Rating Logic

1. **Two images** with similar Elo ratings are selected.
2. The user picks the one they think looks better.
3. The system updates both images’ ratings using the **Elo formula**.

### 🧮 Elo Formula

We use the standard Elo rating system:

```
R' = R + K * (S - E)
```

Where:

* `R` = current rating
* `K` = constant (e.g., 32)
* `S` = actual result (1 = win, 0 = loss)
* `E` = expected result (based on opponent’s rating)

### 📈 Displayed Score

To show ratings more clearly to users, we convert the raw Elo score to a normalized 1–10 scale:

```
Normalized Score = 10 * (Rating - MinRating) / (MaxRating - MinRating)
```

* `MinRating` and `MaxRating` are dynamically determined from all image ratings.
* This makes it easy to compare how well images perform on a familiar 1–10 scale.

---

## ⚠️ Disclaimer

This project is for **fun and experimentation only**. It does not sell data, include ads, or intend to harm. All ratings are anonymous. Please use it responsibly and respectfully.

---

## 🚀 Deployment

**rateme.pics** is fully deployed on [Vercel](https://vercel.com), leveraging:

* Edge functions for fast API routes
* Blob storage for image hosting
* Seamless integration with Next.js and TypeScript

---

## 🚫 Not a Reusable Template

While the code is clean and functional, this project is not intended to be used as a template or starter repo.

It was built for a specific use case and lacks modularity or configuration for other projects.

There is no internal documentation, component breakdown, or developer onboarding.

Use it as a reference or learning resource, not a plug-and-play base for your own apps.

If you're looking for a production-ready template, it's better to start from a documented boilerplate.