'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function Inventario() {
    const [products, setProducts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ id: null, name: '', cost: 0, price: 0, stock: 0, min_stock: 5 })

    const fetchProducts = async () => {
        const res = await axios.get('http://localhost/api/products');
        setProducts(res.data);
    }

    useEffect(() => { fetchProducts() }, [])

    // KPIs de Inventario
    const totalStockValue = products.reduce((acc, p: any) => acc + (p.price * p.stock), 0);
    const totalInvestment = products.reduce((acc, p: any) => acc + (p.cost * p.stock), 0);
    const projectedProfit = totalStockValue - totalInvestment;

    const chartData = products.map((p: any) => ({ name: p.name, value: p.stock }));
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="p-4 md:p-8 space-y-8" style={{ color: '#fdc' }}>

            {/* HEADER & ANALYTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col justify-center">
                    <h1 className="text-4xl font-black tracking-tighter text-blue-500 uppercase">Stock & Inventory</h1>
                    <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-8">Control de activos y rentabilidad</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800/50">
                            <span className="text-[9px] font-black text-slate-500 uppercase block mb-2">Valor Estimado Venta</span>
                            <span className="text-3xl font-black text-emerald-400 font-mono">${totalStockValue.toLocaleString('es-CL')}</span>
                        </div>
                        <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800/50">
                            <span className="text-[9px] font-black text-slate-500 uppercase block mb-2">Utilidad Proyectada</span>
                            <span className="text-3xl font-black text-blue-400 font-mono">${projectedProfit.toLocaleString('es-CL')}</span>
                        </div>
                    </div>
                </div>

                {/* GRÁFICO DE TORTA STOCK */}
                <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800/50 h-[250px]">
                    <h3 className="text-[9px] font-black uppercase text-center mb-4 tracking-widest text-slate-500">Distribución de Stock</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '15px', color: '#fdc' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* TABLA DE PRODUCTOS */}
            <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800/50 overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-slate-800/50 flex justify-between items-center">
                    <h2 className="font-black text-sm uppercase tracking-widest">Listado de Productos</h2>
                    <button onClick={() => { setFormData({ id: null, name: '', cost: 0, price: 0, stock: 0, min_stock: 5 }); setIsModalOpen(true); }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all uppercase">
                        + AGREGAR ITEM
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-800/50">
                                <th className="p-6">Producto</th>
                                <th className="p-6 text-center">Costo</th>
                                <th className="p-6 text-center">Venta</th>
                                <th className="p-6 text-center">Stock</th>
                                <th className="p-6 text-center">Estado</th>
                                <th className="p-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                            {products.map((p: any) => (
                                <tr key={p.id} className="hover:bg-blue-500/5 transition-all group">
                                    <td className="p-6 font-black text-sm uppercase">{p.name}</td>
                                    <td className="p-6 text-center font-mono text-xs text-slate-500">${p.cost.toLocaleString()}</td>
                                    <td className="p-6 text-center font-mono text-sm text-emerald-400 font-bold">${p.price.toLocaleString()}</td>
                                    <td className="p-6 text-center">
                                        <span className={`font-black text-lg ${p.stock <= p.min_stock ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                            {p.stock}
                                        </span>
                                        <div className="text-[8px] text-slate-600 uppercase">Min: {p.min_stock}</div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black ${p.status === 'Disponible' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {p.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center space-x-4">
                                        <button onClick={() => { setFormData(p); setIsModalOpen(true); }} className="text-amber-400 cursor-pointer hover:scale-125 transition-transform">✏️</button>
                                        <button onClick={async () => { if (confirm('¿Eliminar?')) { await axios.delete(`http://localhost/api/products/${p.id}`); fetchProducts(); } }} className="text-red-500 cursor-pointer hover:scale-125 transition-transform">✕</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL GESTIONAR PRODUCTO - SIMÉTRICO Y ETIQUETADO */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter text-blue-500 text-center">Gestionar Producto</h2>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Nombre del Servicio</label>
                                <input type="text" placeholder="Ej: Disney Premium" className="w-full bg-slate-800/50 border border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 mt-1" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Costo Provedor</label>
                                    <input type="number" className="w-full bg-slate-800/50 border border-slate-700 p-4 rounded-2xl outline-none mt-1" value={formData.cost} onChange={e => setFormData({ ...formData, cost: parseInt(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Precio Venta</label>
                                    <input type="number" className="w-full bg-slate-800/50 border border-slate-700 p-4 rounded-2xl outline-none mt-1 text-emerald-400 font-bold" value={formData.price} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Stock Inicial</label>
                                    <input type="number" className="w-full bg-slate-800/50 border border-slate-700 p-4 rounded-2xl outline-none mt-1" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Alerta Mínima</label>
                                    <input type="number" className="w-full bg-slate-800/50 border border-slate-700 p-4 rounded-2xl outline-none mt-1 border-red-500/20" value={formData.min_stock} onChange={e => setFormData({ ...formData, min_stock: parseInt(e.target.value) })} />
                                </div>
                            </div>

                            <div className="pt-4 space-y-2">
                                <button onClick={async () => {
                                    if (formData.id) await axios.put(`http://localhost/api/products/${formData.id}`, formData);
                                    else await axios.post('http://localhost/api/products', formData);
                                    setIsModalOpen(false); fetchProducts();
                                }} className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl font-black uppercase cursor-pointer transition-all shadow-lg shadow-blue-900/40 active:scale-95">
                                    Guardar Cambios
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 text-[10px] font-black uppercase cursor-pointer tracking-widest py-2">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}