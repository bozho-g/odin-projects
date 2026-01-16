import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';

import './App.css';
import Home from './components/chat/Home';
import WakeBanner from './components/misc/WakeBanner';

function App() {
  return (
    <>
      <WakeBanner
        storageKey="railwayWakeBannerDismissed"
        message="This site is hosted on a free render tier that can sleep. The first request may take 30-60 seconds while it wakes up."
      />
      <Toaster position='top-right'
        toastOptions={
          {
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
            }
          }
        }
      />
      <Routes>
        <Route index element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
