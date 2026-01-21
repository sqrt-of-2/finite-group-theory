
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { GroupPage } from './pages/GroupPage';
import { GlossaryPage } from './pages/GlossaryPage';
import { ComparePage } from './pages/ComparePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="groups" element={<Landing />} />
          <Route path="group/:id" element={<GroupPage />} />
          <Route path="glossary" element={<GlossaryPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="*" element={<div>Not found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
