import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';

import './App.css';
import Home from './components/chat/Home';

function App() {
  return (
    <>
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
