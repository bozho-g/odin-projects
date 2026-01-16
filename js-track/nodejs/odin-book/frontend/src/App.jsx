import './App.css';
import { Toaster } from 'sonner';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import { HomeFeed } from './components/HomeFeed';
import UserPage from './pages/UserPage/UserPage';
import { NotFound } from './components/NotFound';
import { PostPage } from './pages/PostPage/PostPage';
import { UsersPage } from './pages/UsersPage/UsersPage';
import { FollowsModal } from './components/FollowsModal/FollowsModal';
import { FollowsPage } from './pages/FollowsPage/FollowsPage';
import WakeBanner from './components/Elements/WakeBanner/WakeBanner';

function App() {
  return (
    <>
      <WakeBanner
        storageKey="railwayWakeBannerDismissed"
        message="This site is hosted on a free render tier that can sleep. The first request may take 30-60 seconds while it wakes up."
      />

      <Toaster position="top-right" richColors closeButton toastOptions={{
        style: {
          background: "var(--background)",
          color: "var(--foreground)"
        }
      }} />

      <Routes>
        <Route path="/" element={<HomePage />}>
          <Route index element={<HomeFeed />} />
          <Route path="all" element={<HomeFeed />} />

          <Route path="profile/:username" element={<UserPage />}>
            <Route
              path="followers"
              element={<FollowsModal type="followers" />}
            />
            <Route
              path="following"
              element={<FollowsModal type="following" />}
            />
          </Route>

          <Route path="follows" element={<FollowsPage />} />
          <Route path="posts/:postId" element={<PostPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;