import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SurveyBuilder from './SurveyBuilder.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SurveyBuilder />
  </StrictMode>,
)
