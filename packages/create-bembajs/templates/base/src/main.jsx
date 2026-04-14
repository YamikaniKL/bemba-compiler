import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { globKeyToPageRoute } from 'bembajs-core';

const pages = import.meta.glob('../amapeji/**/*.bemba', { eager: true });

function App() {
  const routes = [];
  for (const [key, mod] of Object.entries(pages)) {
    const routePath = globKeyToPageRoute(key);
    if (routePath == null || !mod.default) continue;
    const Comp = mod.default;
    routes.push(<Route key={routePath} path={routePath} element={<Comp />} />);
  }
  return (
    <Routes>
      {routes}
      <Route
        path="*"
        element={
          <div style={{ padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
            <p>
              No route matched. Add <code>ukwisulula</code> to a page under <code>amapeji/</code>, or open{' '}
              <a href="/react-demo">/react-demo</a> for a sample React route.
            </p>
          </div>
        }
      />
    </Routes>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
