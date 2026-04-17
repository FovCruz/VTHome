'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'

export default function MantencionClientes() {
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
  const [activeNote, setActiveNote] = useState<string | null>(null)

  // --- ESTADOS DE FILTRO ---
  const [search, setSearch] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('Todas')
  const [filterStatus, setFilterStatus] = useState('Todos')

  const [formData, setFormData] = useState<any>({
    id: null, name: '', username: '', password_acc: '', screens: 1,
    platform: '', months: 1, income: 0, product_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const [renewData, setRenewData] = useState<any>({
    id: null, months: 1, amount: 0, isManual: false, product_id: '', name: ''
  });

  const fetchData = async () => {
    try {
      const [resClients, resProducts] = await Promise.all([
        axios.get('http://localhost/api/clients'),
        axios.get('http://localhost/api/products')
      ]);
      setClients(resClients.data);
      setProducts(resProducts.data);
      setLoading(false);
    } catch (e) { console.error(e); setLoading(false); }
  }

  useEffect(() => { fetchData() }, [])

  const calculateDaysLeft = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const handleEdit = (client: any) => {
    setFormData({
      ...client,
      payment_date: client.payment_date ? client.payment_date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  }

  const handleOpenRenew = (client: any) => {
    setRenewData({ id: client.id, months: 1, amount: 0, isManual: false, product_id: '', name: client.name });
    setIsRenewModalOpen(true);
  };

  const submitRenewal = async () => {
    try {
      await axios.put(`http://localhost/api/clients/renew/${renewData.id}`, renewData);
      setIsRenewModalOpen(false);
      fetchData();
      alert("Renovación procesada con éxito.");
    } catch (e) { alert("Error al renovar."); }
  };

  // --- LÓGICA DE FILTRADO ---
  const filteredClients = clients.filter((c: any) => {
    const days = calculateDaysLeft(c.due_date);
    const status = days > 0 ? 'Activo' : 'Expirado';
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = filterPlatform === 'Todas' || c.platform === filterPlatform;
    const matchesStatus = filterStatus === 'Todos' || status === filterStatus;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 bg-slate-950 min-h-screen" style={{ color: '#fdc' }}>
      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Image src="/logo final.png" alt="Logo" width={60} height={60} className="rounded-2xl border border-slate-800" />
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-blue-500 uppercase">VTHOME OS</h1>
              <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">Customer Management System</p>
            </div>
          </div>
          <button
            onClick={() => { setFormData({ id: null, name: '', username: '', password_acc: '', screens: 1, platform: '', months: 1, income: 0, product_id: '', payment_date: new Date().toISOString().split('T')[0], notes: '' }); setIsModalOpen(true); }}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white cursor-pointer px-10 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 uppercase text-xs"
          >
            + AGREGAR CLIENTE
          </button>
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTROS (RESTAURADA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/40 p-4 rounded-3xl border border-slate-800/50 backdrop-blur-md mb-8">
          <input
            type="text"
            placeholder="Buscar cliente o usuario..."
            className="sm:col-span-2 bg-slate-800/50 border border-slate-700/50 p-3 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-2xl text-sm cursor-pointer outline-none" value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
            <option value="Todas">Plataformas</option>
            {Array.from(new Set(products.map((p: any) => p.name))).map((p: any) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-2xl text-sm cursor-pointer outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="Todos">Estados</option>
            <option value="Activo">Activos</option>
            <option value="Expirado">Expirados</option>
          </select>
        </div>

        {/* TABLA PROFESIONAL */}
        <div className="bg-slate-900/60 rounded-[2.5rem] border border-slate-800/50 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="bg-slate-800/40 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Cliente / Usuario</th>
                  <th className="p-6 text-center">Pants</th>
                  <th className="p-6 text-center text-blue-400">Expiración</th>
                  <th className="p-6 text-center">Días Rest.</th>
                  <th className="p-6 text-right">Inversión Tot.</th>
                  <th className="p-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filteredClients.map((c: any) => {
                  const days = calculateDaysLeft(c.due_date);
                  return (
                    <tr key={c.id} className="hover:bg-blue-500/5 transition-all group">
                      <td className="p-6">
                        <div className="font-bold text-lg group-hover:text-blue-400 transition-colors uppercase">{c.name}</div>
                        <div className="text-slate-500 text-xs font-mono uppercase opacity-70 tracking-tighter">{c.username} • {c.platform}</div>
                      </td>
                      <td className="p-6 text-center font-black">
                        <span className="bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 text-xs">{c.screens}P</span>
                      </td>
                      <td className="p-6 text-center text-sm font-bold">
                        {new Date(c.due_date).toLocaleDateString('es-CL')}
                      </td>
                      <td className="p-6 text-center font-black">
                        <span className={days <= 3 ? 'text-red-500 animate-pulse' : 'text-slate-300'}>{days > 0 ? days : 0}</span>
                      </td>
                      <td className="p-6 text-right font-mono text-emerald-400 font-bold">
                        ${c.income?.toLocaleString('es-CL')}
                      </td>
                      <td className="p-6 text-center space-x-5">
                        {c.notes && (
                          <button onClick={() => setActiveNote(c.notes)} title="Ver Notas" className="text-slate-500 cursor-pointer hover:text-white transition-all text-xl">📝</button>
                        )}
                        <button onClick={() => handleOpenRenew(c)} title="Renovar" className="text-emerald-400 cursor-pointer hover:scale-150 transition-transform text-xl">⚡</button>
                        <button onClick={() => handleEdit(c)} title="Editar" className="text-amber-400 cursor-pointer hover:scale-150 transition-transform text-xl">✏️</button>
                        <button onClick={async () => { if (confirm("¿Eliminar?")) { await axios.delete(`http://localhost/api/clients/${c.id}`); fetchData(); } }} className="text-red-500 cursor-pointer font-bold hover:scale-150 transition-transform text-xl">✕</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL CLIENTE (NUEVO / EDITAR) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-3xl font-black mb-8 text-white uppercase tracking-tighter text-center">{formData.id ? 'Modificar Perfil' : 'Alta de Cliente'}</h2>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (formData.id) {
                  await axios.put(`http://localhost/api/clients/${formData.id}`, formData);
                } else {
                  await axios.post('http://localhost/api/clients', formData);
                }
                setIsModalOpen(false); fetchData();
              } catch (err) { alert("Error al procesar el registro."); }
            }} className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Nombre Completo</label>
                  <input type="text" required className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-slate-700 focus:border-blue-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Usuario</label>
                    <input type="text" required className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-slate-700" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Password</label>
                    <input type="text" required className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-slate-700" value={formData.password_acc} onChange={e => setFormData({ ...formData, password_acc: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Pantallas</label>
                    <input type="number" required className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-slate-700" value={formData.screens} onChange={e => setFormData({ ...formData, screens: parseInt(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-blue-400 uppercase ml-2 mb-1 block">Fecha Ingreso</label>
                    <input type="date" required className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-blue-500/30 cursor-pointer" value={formData.payment_date} onChange={e => setFormData({ ...formData, payment_date: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-emerald-500 uppercase ml-2 mb-1 block">Producto / Servicio</label>
                  <select
                    className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-emerald-500/20 cursor-pointer"
                    value={formData.product_id || ""}
                    onChange={(e) => {
                      const p = products.find((prod: any) => prod.id === parseInt(e.target.value));
                      if (p) setFormData({ ...formData, product_id: p.id, platform: p.name, income: p.price });
                    }}
                  >
                    <option value="">Seleccionar del Inventario</option>
                    {products.map((p: any) => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={p.stock <= 0 && formData.product_id !== p.id} // Bloquear si no hay stock, a menos que ya sea el producto del cliente
                      >
                        {p.name} {p.stock <= 0 ? '(AGOTADO)' : `($${p.price.toLocaleString()} | Stock: ${p.stock})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Notas Adicionales</label>
                  <textarea rows={4} className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-slate-700 resize-none" value={formData.notes || ""} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Dirección MAC, códigos, etc..."></textarea>
                </div>
              </div>

              <div className="md:col-span-2 pt-6 flex flex-col gap-3">
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-[2rem] font-black uppercase shadow-2xl cursor-pointer">
                  {formData.id ? 'Actualizar Información' : 'Registrar Cliente'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] cursor-pointer hover:text-white transition-all py-2 text-center">Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL RENOVACIÓN --- */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black mb-1 text-emerald-400 uppercase tracking-tighter text-center">Nueva Suscripción</h2>
            <p className="text-[9px] text-slate-500 text-center font-bold mb-8 uppercase tracking-[0.2em] italic">Cliente: {renewData.name}</p>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 block mb-2 tracking-widest">Elegir de Inventario</label>
                <select
                  className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-slate-700 cursor-pointer"
                  value={renewData.product_id || ""}
                  onChange={(e) => {
                    if (e.target.value === "manual") {
                      setRenewData({ ...renewData, isManual: true, product_id: '' });
                    } else {
                      const p = products.find((prod: any) => prod.id === parseInt(e.target.value));
                      if (p) setRenewData({ ...renewData, amount: p.price, product_id: p.id, isManual: false, months: 1 });
                    }
                  }}
                >
                  <option value="">Seleccionar Producto...</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                      {p.name} {p.stock <= 0 ? '--- AGOTADO ---' : `($${p.price.toLocaleString()})`}
                    </option>
                  ))}
                  <option value="manual">--- INGRESO MANUAL ---</option>
                </select>
              </div>

              {renewData.isManual && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="text-[10px] font-black text-blue-400 uppercase ml-2 block mb-1">Meses</label>
                    <input type="number" className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-blue-500/30" value={renewData.months} onChange={e => setRenewData({ ...renewData, months: parseInt(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-blue-400 uppercase ml-2 block mb-1">Monto $</label>
                    <input type="number" className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-blue-500/30 font-mono" value={renewData.amount} onChange={e => setRenewData({ ...renewData, amount: parseInt(e.target.value) })} />
                  </div>
                </div>
              )}

              <div className="pt-6 flex flex-col gap-3">
                <button onClick={submitRenewal} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-5 rounded-[2rem] font-black uppercase shadow-xl cursor-pointer">Confirmar Renovación</button>
                <button onClick={() => setIsRenewModalOpen(false)} className="text-slate-600 text-[10px] font-black uppercase cursor-pointer py-2 text-center">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP NOTAS --- */}
      {activeNote && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
          <div className="bg-slate-900 border border-blue-500/20 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative">
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 italic tracking-widest">Notas Técnicas</h3>
            <p className="text-sm leading-relaxed text-slate-300 italic">"{activeNote}"</p>
            <button onClick={() => setActiveNote(null)} className="absolute -top-3 -right-3 bg-slate-800 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-red-500 transition-all text-white">✕</button>
          </div>
        </div>
      )}

    </div>
  )
}