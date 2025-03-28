import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Header } from "./pages/Header";
import { Contact } from "./pages/Contact";

function App() {
  return (
    <Router>
      <Header />
      <main className="">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
