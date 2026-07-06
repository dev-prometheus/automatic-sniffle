import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Recovery from './pages/Recovery'
import './lib/appkit'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/recovery/:id" element={<Recovery />} />
      </Routes>
    </BrowserRouter>
  )
}
