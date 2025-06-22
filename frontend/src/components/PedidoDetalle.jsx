// src/components/PedidoDetalle.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const estadosDisponibles = [
  'Pago verificado',
  'En fábrica',
  'Empaquetado',
  'Enviado',
  'En camino',
  'Entregado',
  'Recibido (cliente)',
  'Cancelado'
];

const PedidoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarPedido = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/seguimiento/' + id);
      if (!res.ok) throw new Error('Error al buscar pedido');
      const data = await res.json();
      setPedido(data);
      setNuevoEstado(data.estado || '');
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar el pedido:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedido();
  }, [id]);

  const actualizarEstado = async () => {
    if (!nuevoEstado) return;

    try {
      setGuardando(true);
      const res = await fetch(import.meta.env.VITE_API_URL + '/admin/pedidos/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado })
      });

      if (!res.ok) throw new Error('Error actualizando estado');

      toast.success('✅ Estado actualizado correctamente');

      // ✅ Recargar el pedido desde el backend
      await cargarPedido();
    } catch (err) {
      console.error(err);
      toast.error('❌ No se pudo actualizar el estado');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p className="text-white">Cargando...</p>;
  if (!pedido) return <p className="text-white">Pedido no encontrado.</p>;

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
        className="relative z-20 px-6 text-white flex flex-col items-center space-y-6 w-full max-w-4xl"
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

        <motion.h2
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.3 }}
        >
          🧾 Detalle del Pedido
        </motion.h2>

        <motion.div
          className="bg-white text-black rounded-2xl shadow-lg w-full p-6 text-left space-y-3 backdrop-blur-sm bg-opacity-90"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.5 }}
        >
          <p><strong>ID:</strong> {pedido.id}</p>
          <p><strong>Estado actual:</strong> {pedido.estado}</p>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Cambiar estado:</label>
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              className="w-full px-4 py-2 rounded text-black bg-white"
            >
              <option value="">Seleccionar nuevo estado</option>
              {estadosDisponibles.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
            <button
              onClick={actualizarEstado}
              disabled={guardando}
              className="mt-3 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Actualizar estado'}
            </button>
          </div>

          <p><strong>Total:</strong> ${pedido.totalUSD} / Bs {pedido.totalBs}</p>
          <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleDateString()}</p>
          <p><strong>Productos:</strong> {pedido.productos.join(', ')}</p>
          <p><strong>Método de pago:</strong> {pedido.metodoPago}</p>
          <p><strong>Datos de entrega:</strong> {pedido.datosEntrega}</p>
          <p><strong>Cliente:</strong> {pedido.cliente.nombre} ({pedido.cliente.telefono})</p>
        </motion.div>

        <button
          onClick={() => navigate('/admin/pedidos')}
          className="mt-4 py-2 px-6 border border-white text-white text-sm uppercase tracking-wider hover:bg-white hover:text-black transition rounded-full shadow-md backdrop-blur-sm"
        >
          ← Volver a Pedidos
        </button>
      </motion.div>
    </section>
  );
};

export default PedidoDetalle;
