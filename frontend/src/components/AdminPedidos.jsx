// src/components/AdminPedidos.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/admin/pedidos')
      .then((res) => {
        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        return res.json();
      })
      .then((data) => {
        setPedidos(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar pedidos:', error);
        setLoading(false);
      });
  }, []);

  const handleLogoutAndReturn = () => {
    logout();
    navigate('/');
  };

  const handlePedidoClick = (id) => {
    navigate(`/admin/pedidos/${id}`);
  };

  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundImage: "url('/hero-jcavalier.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <motion.div
        className="absolute inset-0 bg-black z-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.4 }}
      />

      <motion.div
        className="absolute inset-0 z-10 backdrop-blur-xl bg-white bg-opacity-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.8, delay: 0.6 }}
      />

      <motion.div
        className="relative z-20 px-6 text-white flex flex-col items-center space-y-8 w-full max-w-6xl"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.25 } } }}
      >
        <motion.img
          src="/LogoB.png"
          alt="Logo JCavalier"
          className="w-20 h-20 object-contain"
          initial={{ scale: 0 }}
          animate={{ scale: 2, y: -20 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        <motion.h1
          className="text-2xl font-bold mb-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.3 }}
        >
          📦 Pedidos Recibidos
        </motion.h1>

        {loading ? (
          <p className="text-white/80">Cargando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <p className="text-white/80">No hay pedidos registrados aún.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full bg-white text-black rounded-lg shadow text-sm">
              <thead>
                <tr className="bg-gray-200 text-left uppercase tracking-wider">
                  <th className="p-3">ID</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t hover:bg-gray-100 cursor-pointer"
                    onClick={() => handlePedidoClick(p.id)}
                  >
                    <td className="p-3 font-mono text-xs break-all">{p.id}</td>
                    <td className="p-3">{p.cliente}</td>
                    <td className="p-3 font-semibold">{p.estado}</td>
                    <td className="p-3">${p.total} / Bs {p.totalBs}</td>
                    <td className="p-3">{new Date(p.fecha).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

<button
  onClick={() => navigate('/admin/dashboard')}
  className="mt-6 py-2 px-6 border border-white text-white text-sm uppercase tracking-wider hover:bg-white hover:text-black transition rounded-full shadow-md backdrop-blur-sm"
>
  ← Volver al Panel
</button>

      </motion.div>
    </section>
  );
};

export default AdminPedidos;
