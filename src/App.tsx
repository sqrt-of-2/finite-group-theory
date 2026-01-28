
// src/App.tsx
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { GroupPage } from './pages/GroupPage';
import { GlossaryPage } from './pages/GlossaryPage';

// Dispatcher component that decides what to render based on query string
const QueryDispatcher = () => {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('group');
  const page = searchParams.get('page');

  if (groupId) {
    return <GroupPage id={groupId} />;
  }

  if (page === 'glossary') {
    return <GlossaryPage />;
  }

  // Default or page=catalog
  return <Landing />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<QueryDispatcher />} />
          <Route path="*" element={<QueryDispatcher />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
