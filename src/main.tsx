
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("API BASE:", import.meta.env.VITE_DJANGO_API_URL);

createRoot(document.getElementById("root")!).render(<App />);
