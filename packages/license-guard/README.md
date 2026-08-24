# @masdannn/license-guard

Universal Remote License Guard & Killswitch SDK for Web Applications and Server Backends.

---

## 🚀 Quick Setup (CLI Pairing)

Jalankan perintah ini di direktori project Anda:

```bash
npx @masdannn/license-guard init
```

Terminal akan menampilkan **Pairing Code** (misal `LG-8942-XK91`). Masukkan kode tersebut di [Control Hub Dashboard](https://license-tau-nine.vercel.app/projects/new) untuk menghubungkan project secara otomatis.

---

## 📦 Manual Installation

```bash
npm install @masdannn/license-guard
# or
yarn add @masdannn/license-guard
# or
pnpm add @masdannn/license-guard
```

---

## 💻 Usage

### 1. React / Next.js / Vue / SPA Frontend

```javascript
import { useEffect } from 'react';
import { initGuard } from '@masdannn/license-guard';

export default function App() {
  useEffect(() => {
    initGuard({
      apiKey: 'YOUR_PROJECT_API_KEY',
    });
  }, []);

  return <div>Your App Content</div>;
}
```

### 2. Node.js / Express Backend Middleware

```javascript
import express from 'express';
import { guardMiddleware } from '@masdannn/license-guard';

const app = express();

app.use(
  guardMiddleware({
    apiKey: 'YOUR_PROJECT_API_KEY',
    domain: 'your-domain.com',
  })
);

app.get('/', (req, res) => {
  res.send('Protected App is running!');
});
```

### 3. Plain HTML Native (1 Baris Script)

```html
<script src="https://license-tau-nine.vercel.app/guard.js" data-api-key="YOUR_PROJECT_API_KEY"></script>
```

---

## 📄 License
MIT © [Iktiar Ramadani](https://github.com/iktiarr)
