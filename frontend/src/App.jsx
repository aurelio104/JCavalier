import React from 'react';
import { Routes, Route } from 'react-router-dom';

import JCavalierHeader from './components/JCavalierHeader.jsx';
import HeroLanding from './components/HeroLanding.jsx';
import AboutSection from './components/AboutSection.jsx';
import CatalogView from './components/CatalogView.jsx';
import ContactSection from './components/ContactSection.jsx';
import Footer from './components/Footer.jsx';
import SocialFloatButtons from './components/SocialFloatButtons.jsx';
import AdminLoginForm from './components/AdminLoginForm.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import DashboardProductos from './components/DashboardProductos.jsx';
import AdminPedidos from './components/AdminPedidos.jsx';
import PedidoDetalle from './components/PedidoDetalle.jsx'; // ✅ Nuevo import
import PrivateRoute from './routes/PrivateRoute.jsx';

function App() {
  return (
    <div className="min-h-screen bg-neutral text-white overflow-x-hidden">
      <Routes>
        {/* Página pública principal */}
        <Route
          path="/"
          element={
            <>
              <JCavalierHeader />
              <main>
                <HeroLanding />
                <CatalogView />
                <AboutSection />
                <ContactSection />
                <SocialFloatButtons />
                <Footer />
              </main>
            </>
          }
        />

        {/* Login */}
        <Route path="/admin" element={<AdminLoginForm />} />

        {/* Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Gestión productos */}
        <Route
          path="/admin/productos"
          element={
            <PrivateRoute>
              <DashboardProductos />
            </PrivateRoute>
          }
        />

        {/* Gestión pedidos */}
        <Route
          path="/admin/pedidos"
          element={
            <PrivateRoute>
              <AdminPedidos />
            </PrivateRoute>
          }
        />

        {/* ✅ Vista detalle pedido */}
        <Route
          path="/admin/pedidos/:id"
          element={
            <PrivateRoute>
              <PedidoDetalle />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
