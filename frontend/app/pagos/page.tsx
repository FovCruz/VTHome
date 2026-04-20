'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function HistorialPagos() {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchPayments = async () => {
        try {
            const res = await axios.get('${process.env.NEXT_PUBLIC_API_URL}/payments-history');
            setPayments(res.data);
            setLoading(false);
        } catch (e) { console.error(e); setLoading(false); }
    }

    useEffect(() => { fetchPayments() }, [])

    // Calcular total recaudado en la vista actual
    const totalRecaudado = payments.reduce((acc, p: any) => acc + p.amount, 0);

    return (
        <div className="p-4 md:p-8 bg-slate-950 min-h-screen" style={{ color: '#fdc' }}>
            <div className="max-w-[1200px] mx-auto">

                <header className="mb-10 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-emerald-500 uppercase">Historial Contable</h1>
                            <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase">VTHOME Financial Control</p>
                        </div>

                        <div className="bg-slate-900/80 p-6 rounded-[2rem] border border-emerald-500/30 backdrop-blur-xl shadow-2xl shadow-emerald-500/5">
                            <span className="text-[10px] text-slate-500 block font-black uppercase mb-1 tracking-widest">Recaudación Total</span>
                            <span className="text-4xl font-mono font-black text-emerald-400">
                                ${totalRecaudado.toLocaleString('es-CL')}
                            </span>
                        </div>
                    </div>

                    {/* FILTROS DE FECHA - DISEÑO ELEGANTE */}
                    <div className="flex flex-wrap gap-4 bg-slate-900/40 p-4 rounded-3xl border border-slate-800/50">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase text-slate-500">Desde:</span>
                            <input type="date" className="bg-slate-800 p-2 rounded-xl text-xs border border-slate-700 outline-none focus:border-emerald-500 transition-all cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase text-slate-500">Hasta:</span>
                            <input type="date" className="bg-slate-800 p-2 rounded-xl text-xs border border-slate-700 outline-none focus:border-emerald-500 transition-all cursor-pointer" />
                        </div>
                        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                            Filtrar Reporte
                        </button>
                    </div>
                </header>

                <div className="bg-slate-900/60 rounded-[2.5rem] border border-slate-800/50 shadow-2xl overflow-hidden backdrop-blur-xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/40 text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] border-b border-slate-800/50">
                                <th className="p-6">Fecha Pago</th>
                                <th className="p-6">Cliente</th>
                                <th className="p-6 text-center">Meses</th>
                                <th className="p-6 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                            {payments.map((p: any) => (
                                <tr key={p.id} className="hover:bg-emerald-500/5 transition-colors group">
                                    <td className="p-6 font-mono text-xs text-slate-400">
                                        {new Date(p.payment_date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-6">
                                        <div className="font-bold text-lg group-hover:text-emerald-400 transition-colors">{p.client?.name}</div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className="bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black border border-slate-700">
                                            {p.months} {p.months === 1 ? 'MES' : 'MESES'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right font-mono font-black text-emerald-400">
                                        + ${p.amount.toLocaleString('es-CL')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {payments.length === 0 && (
                        <div className="p-20 text-center text-slate-600 font-medium italic">No hay pagos registrados aún.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
