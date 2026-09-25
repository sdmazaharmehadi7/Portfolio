import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { NavigationProvider } from './context/NavigationContext';
import { useNavigation } from './hooks/useNavigation';
import { Navbar, Container, Divider } from './components';
import Hero from './sections/Hero';
import NeuralNetworkSection from './sections/NeuralNetworkSection';
import Projects from './sections/Projects';
import About from './sections/About';
import Skills from './sections/Skills';
import Experience from './sections/Experience';
import Resume from './sections/Resume';
import Contact from './sections/Contact';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

function PortfolioView() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Sticky Top Navigation */}
      <Navbar />

      <main style={{ paddingTop: 'var(--header-height, 60px)' }}>
        {/* Landing Page Hero Section with 3D Transformer Architecture */}
        <Hero />

        <Container>
          <Divider spacing="md" />
        </Container>

        {/* 3D Artificial Neural Network Showcase Section */}
        <NeuralNetworkSection />

        <Container>
          <Divider spacing="md" />
        </Container>

        {/* Selected Work Projects Section (Editorial List) */}
        <Projects />

        <Container>
          <Divider spacing="md" />
        </Container>

        {/* About Section */}
        <About />

        <Container>
          <Divider spacing="md" />
        </Container>

        {/* Skills Section */}
        <Skills />

        <Container>
          <Divider spacing="md" />
        </Container>

        {/* Experience, Internships, Achievements & Education Section */}
        <Experience />

        <Container>
          <Divider spacing="md" />
        </Container>

        {/* Dedicated Resume Section */}
        <Resume />

        <Container>
          <Divider spacing="md" />
        </Container>

        {/* Final Contact & Footer Section */}
        <Contact />
      </main>
    </div>
  );
}

function AppContent() {
  const { currentPath } = useNavigation();

  if (currentPath === '/admin/login') {
    return <AdminLogin />;
  }

  if (currentPath === '/admin/dashboard') {
    return <AdminDashboard />;
  }

  return <PortfolioView />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AuthProvider>
  );
}
