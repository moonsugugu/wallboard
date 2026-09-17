import { Route, Routes } from 'react-router-dom'
import Board from './pages/Board'
import Home from './pages/Home'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/board/:code" element={<Board />} />
    </Routes>
  )
}
