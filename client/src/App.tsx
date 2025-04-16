import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Header } from "./pages/Header";
import { Contact } from "./pages/Contact";
import { LiveMap } from "./pages/LiveMap";

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/live-map" element={<LiveMap />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
