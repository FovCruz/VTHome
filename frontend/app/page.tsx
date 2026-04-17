'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line 
} from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [clients, setClients] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadDashboard = async () => {
    setIsLoaded(false);
    setProgress(20);
    try {
      const [resStats, resClients] = await Promise.all([
        axios.get(`http://localhost/api/dashboard-stats?month=${selectedMonth}`),
        axios.get('http://localhost/api/clients')
      ]);
      setProgress(80);
      setData(resStats.data);
      setClients(resClients.data);
      
      setTimeout(() => {
        setProgress(100);
        setIsLoaded(true);
      }, 400);
    } catch (e) { 
      console.error("Error cargando dashboard:", e);
      // Evitamos que se quede pegado en carga si falla la API
      setIsLoaded(true); 
    }
  }

  useEffect(() => { loadDashboard() }, [selectedMonth]);

  // Pantalla de carga mejorada
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 space-y-6">
        <div className="relative w-64 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center">
          <p className="text-white text-2xl font-black tracking-tighter animate-pulse uppercase">VTHOME OS</p>
          <p className="text-blue-500 text-[10px] font-bold tracking-[0.4em] uppercase opacity-50">Sincronizando Módulos... {progress}%</p>
        </div>
      </div>
    );
  }

  // Cálculos seguros
  const activeCount = clients.filter(c => new Date(c.due_date) > new Date()).length;
  const inactiveCount = clients.length - activeCount;

  return (
    <div className="p-2 md:p-6 bg-slate-950 min-h-screen text-[#fdc] max-h-screen flex flex-col font-sans overflow-hidden">
      <div className="max-w-[1800px] mx-auto w-full space-y-4 flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Dashboard</h1>
            <p className="text-blue-500 text-[9px] font-bold tracking-[0.3em] uppercase">Status Intelligence</p>
          </div>
          <select 
            className="bg-slate-800 border border-slate-700 p-2 rounded-xl text-xs font-bold text-white outline-none cursor-pointer"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>
                {new Intl.DateTimeFormat('es-CL', { month: 'long' }).format(new Date(2026, i, 1)).toUpperCase()}
              </option>
            ))}
          </select>
        </header>

        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KPICard title="Ingreso Real" value={`$${(data?.realProfit || 0).toLocaleString()}`} color="text-emerald-400" />
          <KPICard title="Total en Caja" value={`$${(data?.totalCash || 0).toLocaleString()}`} color="text-blue-400" />
          <KPICard title="Activos/Inact." value={`${activeCount} / ${inactiveCount}`} color="text-purple-400" />
          <KPICard title="Suscripciones" value={clients.length} color="text-pink-400" />
          
          <div className={`${(data?.lowStock?.length > 0) ? 'bg-amber-500/10 border-amber-500/50' : 'bg-emerald-500/10 border-emerald-500/50'} border p-3 rounded-2xl`}>
            <p className={`text-[8px] font-black uppercase ${(data?.lowStock?.length > 0) ? 'text-amber-500' : 'text-emerald-400'} mb-1`}>
               {(data?.lowStock?.length > 0) ? 'Stock Crítico ⚠️' : 'Stock Total ✔️'}
            </p>
            {(data?.lowStock?.length > 0) ? (
              data.lowStock.slice(0, 2).map((p: any) => (
                <p key={p.name} className="text-[10px] font-bold text-amber-200 truncate">{p.name}: {p.stock}</p>
              ))
            ) : <p className="text-[10px] text-emerald-400 font-bold uppercase">Óptimo</p>}
          </div>
        </div>

        {/* MIDDLE SECTION: GRÁFICOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
          <GraphBox title="Ventas Diarias (Líneas)">
            <ResponsiveContainer width="100%" height="100%">
              {/* Agregamos margin para que no se corten los puntos */}
              <LineChart data={data?.lineData || []} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                {/* Mostramos el eje X para verificar que los días cargan */}
                <XAxis dataKey="day" fontSize={9} tick={{fill: '#475569'}} axisLine={false} tickLine={false} />
                <YAxis hide /> 
                <Tooltip contentStyle={{background:'#0f172a', border:'none', borderRadius:'8px', fontSize:'10px'}} />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphBox>

          <GraphBox title="Productos Vendidos (Torta)">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data?.pieData || []} 
                  innerRadius="50%" 
                  outerRadius="80%" 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {(data?.pieData || []).map((_: any, i: number) => (
                    <Cell key={i} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][i % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </GraphBox>

          <GraphBox title="Histórico 6 Meses (Barras)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.barData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <Bar dataKey="total" fill="#3b82f6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GraphBox>
        </div>

        {/* BOTTOM SECTION: LISTAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[180px] mb-2">
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-black uppercase text-orange-500 mb-2">Próximos Vencimientos</h3>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-2 scrollbar-hide">
              {clients.sort((a:any, b:any) => new Date(a.due_date).getTime() - new Date().getTime()).slice(0, 4).map((c:any, i) => (
                <div key={c.id} className={`p-2 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center ${i === 3 ? 'opacity-30 blur-[0.5px]' : ''}`}>
                  <span className="text-[10px] font-bold uppercase truncate w-20 text-white">{c.name.split(' ')[0]}</span>
                  <span className="text-[9px] text-red-500 font-black">{new Date(c.due_date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-black uppercase text-emerald-400 mb-2">Últimos Movimientos</h3>
            <div className="overflow-y-auto pr-2 scrollbar-hide">
               {(data?.lineData || []).filter((d:any) => d.total > 0).slice(-4).map((d:any, idx:number) => (
                 <div key={idx} className="flex justify-between border-b border-slate-800 py-2 last:border-0">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Día {d.day} de {new Intl.DateTimeFormat('es-CL', { month: 'short' }).format(new Date(2026, selectedMonth - 1))}</span>
                   <span className="text-[10px] font-black text-emerald-400">${d.total.toLocaleString()}</span>
                 </div>
               ))}
               {(data?.lineData?.filter((d:any) => d.total > 0).length === 0) && (
                 <p className="text-[10px] text-slate-600 text-center mt-4 uppercase font-bold">Sin movimientos este mes</p>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// Subcomponentes para limpieza de código
function KPICard({ title, value, color }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-2xl flex flex-col justify-center">
      <p className="text-[8px] font-black uppercase text-slate-500 mb-0.5">{title}</p>
      <p className={`text-lg font-black tracking-tighter leading-none ${color}`}>{value}</p>
    </div>
  )
}

function GraphBox({ title, children }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-[2rem] flex flex-col overflow-hidden">
      <p className="text-[9px] font-black uppercase mb-3 text-slate-500 tracking-widest">{title}</p>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  )
}