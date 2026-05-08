import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Matches from './pages/Matches'
import AddMatch from './pages/AddMatch'
import EditMatch from './pages/EditMatch'
import Rankings from './pages/Rankings'
import Players from './pages/Players'
import H2H from './pages/H2H'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#080c14] text-white">
        <Navbar />
        <main className="max-w-2xl mx-auto pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/new" element={<AddMatch />} />
            <Route path="/matches/:id/edit" element={<EditMatch />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/h2h" element={<H2H />} />
            <Route path="/players" element={<Players />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
