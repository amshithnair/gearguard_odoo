import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PGliteProvider } from '@electric-sql/pglite-react'
import { db, initDB } from './db/client'
import './index.css'
import App from './App.tsx'

// Simple helper to wait for DB init
function DbLoader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDB().then(() => setReady(true));
  }, []);

  if (!ready) return <div className="h-screen w-full flex items-center justify-center bg-zinc-900 text-white">Initializing GearGuard Database...</div>;

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PGliteProvider db={db}>
      <DbLoader>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DbLoader>
    </PGliteProvider>
  </StrictMode>,
)
