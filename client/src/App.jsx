import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import Register from "./Register";
import Login from "./Login";
import Landing from "./Landing";
import Dashboard from "./Dashboard";

function App() {
  // Dashboard route expects user info from location state
  const DashboardRoute = () => {
    const location = useLocation();
    const user = location.state?.user;
    return <Dashboard user={user} />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Hero />
              <Features />
              <Testimonials />
              <FAQ />
              <Footer />
            </>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
