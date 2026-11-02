import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { App, ErrorBoundary } from './App';
import './styles.css';
const Router = import.meta.env.MODE === 'github-pages' ? HashRouter : BrowserRouter;
createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><Router><App/></Router></ErrorBoundary></StrictMode>);
