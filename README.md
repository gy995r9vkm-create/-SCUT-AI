# SCUT AI

SCUT AI is a full-stack ecosystem app combining AI tools (Gemini-powered chat, agents, translation, code generation), a social/community platform, a marketplace, and on-chain payments (SCUT Pay) on Polygon.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS
- **Backend:** Express (`server.ts`), proxies Gemini API calls so the API key never reaches the browser
- **Database/Auth:** Firebase (Firestore + Authentication)
- **Blockchain:** Polygon Mainnet, via [ethers.js](https://docs.ethers.org/) — MetaMask supported natively; WalletConnect requires setup (see below)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key. Kept server-side only — never exposed to the client. |
| `APP_URL` | The URL this app is hosted at (used for OAuth callbacks and self-referential links). |
| `ALLOWED_ORIGINS` | *(optional)* Comma-separated list of origins allowed to call the API cross-origin. Leave unset for same-origin only. |

### 3. Configure Firebase

Firestore config lives in `src/lib/firebase.ts`. Make sure it points at your own Firebase project.

**Deploy the security rules** — this is a separate step from deploying the app itself:

```bash
firebase deploy --only firestore:rules
```

The `firestore.rules` file in this repo defines per-collection access control (including the master admin allowlist). If you don't deploy it, Firestore falls back to whatever rules are already live on your project.

### 4. Run locally

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
npm run start
```

## Admin access

There is a single master admin account, identified by email (`gabrielicloudi@icloud.com`), checked both client-side (UI gating) and server-side (Firestore rules `isAdmin()`). To change the admin account, update it in both places:
- `firestore.rules` (`isAdmin()` function)
- `src/components/AuthModals.tsx`, `src/components/AdminDashboard.tsx`, `src/App.tsx`, `src/components/ScutChatPage.tsx`, `src/components/CommunityHubPage.tsx`

## SCUT Token

- **Network:** Polygon Mainnet
- **Contract:** `0x60Edb815e19E3270e027bE1aC6f9917297a21497`
- Centralized as `SCUT_TOKEN_ADDRESS` in `src/lib/web3.ts` — update it there if the contract ever changes.

## Known limitations / not yet built

- **WalletConnect** requires a real WalletConnect Cloud Project ID + SDK integration. It currently shows a clear "not configured" error rather than a fake connection.
- **Creator Dashboard / Creator Wallet / Withdraw system** (80% creator / 20% platform fee split) is not yet built.
- **Video/Audio calling** and **live streaming** are not yet implemented.
- **Card billing** isn't connected — subscription upgrades are paid for on-chain (POL) from a connected wallet.
- **Merchant analytics** (`BusinessPage.tsx`) has no real data source yet — shows honest empty states.

## Security notes

- All payments (SCUT Pay, subscriptions, marketplace checkout) require a real connected wallet and a real on-chain transaction — there is no mock/simulated payment path.
- Firestore rules are the actual access-control boundary; the client-side admin checks are UI convenience only and must not be relied on alone.
