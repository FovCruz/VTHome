'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function ConfigPage() {
  const [theme, setTheme] = useState('dark')
  const [confirmDeleteAll, setConfirmDeleteAll] = useState('')
  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState('')
  
  // NUEVO: Estado para el Combobox de borrado masivo
  const [massResetOption, setMassResetOption] = useState('clients')

  useEffect(() => {
    axios.get('${process.env.NEXT_PUBLIC_API_URL}/clients').then(res => setClients(res.data))
  }, [])

  // ACCIÓN: Borrado Masivo (Clientes o Inventario)
  const handleMassReset = async () => {
    try {
      if (massResetOption === 'clients') {
        if (confirm("¿BORRAR TODOS LOS CLIENTES? Esta acción eliminará el historial de pagos y vaciará la tabla de clientes. Se conservará el inventario.")) {
          await axios.post('http://localhost/api/config/reset-all-clients');
          alert("Todos los clientes han sido eliminados correctamente.");
          window.location.reload();
        }
      } else if (massResetOption === 'inventory') {
        if (confirm("¿VACIAR INVENTARIO? Se eliminarán todos los productos y los clientes activos quedarán 'Sin Servicio'. Esta acción no se puede deshacer.")) {
          await axios.post('${process.env.NEXT_PUBLIC_API_URL}/config/reset-inventory');
          alert("Inventario vaciado correctamente.");
          window.location.reload();
        }
      }
    } catch (e) {
      alert("Error de conexión al procesar la solicitud.");
    }
  }

  // ACCIÓN: Borrado Total (Nuclear)
  const handleNuclearReset = async () => {
    if (confirmDeleteAll === 'ELIMINAR TODO') {
      try {
        await axios.post('${process.env.NEXT_PUBLIC_API_URL}/config/nuclear', { confirm_text: confirmDeleteAll });
        alert("Sistema formateado con éxito. Todos los datos han sido eliminados.");
        window.location.reload();
      } catch (e) { alert("Error en el proceso."); }
    }
  }

  return (
    <div className={`p-4 md:p-8 min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-[#fdc]' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto space-y-10">
        
        <header>
          <h1 className="text-4xl font-black tracking-tighter text-blue-500 uppercase">Configuración</h1>
          <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">VTHOME OS Control Panel</p>
        </header>

        {/* SECCIÓN 1: APARIENCIA */}
        <section className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl">
          <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Personalización Visual
          </h2>
          <div className="flex gap-4">
            <button 
              onClick={() => setTheme('dark')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all font-bold uppercase text-xs cursor-pointer ${theme === 'dark' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}
            >
              MODO OSCURO (Recomendado)
            </button>
            <button 
              onClick={() => setTheme('light')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all font-bold uppercase text-xs cursor-pointer ${theme === 'light' ? 'border-blue-500 bg-blue-500/10 text-blue-600' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}
            >
              MODO CLARO
            </button>
          </div>
        </section>

        {/* SECCIÓN 2: MANTENIMIENTO DE DATOS */}
        <section className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl space-y-8">
          <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Mantenimiento de Datos
          </h2>

          {/* Reset Individual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-slate-800/20 p-6 rounded-3xl border border-slate-800/50">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Limpiar Cliente Específico</label>
              <select 
                className="w-full bg-slate-900/80 p-4 rounded-2xl outline-none border border-slate-700 text-xs cursor-pointer"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button 
              onClick={async () => { 
                if(selectedClientId && confirm("¿Resetear suscripciones de este cliente? El stock del producto actual será devuelto al inventario.")) { 
                  try {
                    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/config/reset-client/${selectedClientId}`); 
                    alert(res.data.message); 
                    window.location.reload(); 
                  } catch (e) {
                    alert("Error al resetear al cliente.");
                  }
                } 
              }}
              className="bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer text-white h-[46px]"
            >
              Resetear Cliente
            </button>
          </div>

          {/* COMBOBOX: Limpieza Masiva */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-slate-800/20 p-6 rounded-3xl border border-slate-800/50">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Limpieza Masiva de Tablas</label>
              <select 
                className="w-full bg-slate-900/80 p-4 rounded-2xl outline-none border border-slate-700 text-xs cursor-pointer text-amber-500 font-bold"
                value={massResetOption}
                onChange={(e) => setMassResetOption(e.target.value)}
              >
                <option value="clients">Vaciar Cartera de Clientes (Mantiene Productos)</option>
                <option value="inventory">Vaciar Inventario Completo (Mantiene Clientes)</option>
              </select>
            </div>
            <button 
              onClick={handleMassReset}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 p-4 rounded-2xl font-black text-[10px] uppercase cursor-pointer transition-all h-[46px]"
            >
              {massResetOption === 'clients' ? 'Resetear Clientes' : 'Resetear Inventario'}
            </button>
          </div>
        </section>

        {/* SECCIÓN 3: ZONA DE PELIGRO (NUCLEAR) */}
        <section className="bg-red-950/20 p-8 rounded-[2.5rem] border border-red-900/30 backdrop-blur-xl border-dashed">
          <h2 className="text-red-500 text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            ⚠️ ZONA DE PELIGRO ⚠️
          </h2>
          <p className="text-xs text-red-400/60 mb-6 leading-relaxed">
            Al ejecutar el reseteo de fábrica, se eliminarán <strong className="text-red-400">Clientes, Productos de Inventario, Historial de Pagos y Configuraciones</strong>. La aplicación quedará totalmente vacía como recién instalada.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-red-400 uppercase ml-2 block tracking-widest">
                Para borrar todos los datos de la aplicacion, debes escribir "ELIMINAR TODO"
              </label>
              <input 
                type="text" 
                className="w-full bg-red-950/30 border border-red-900/50 p-4 rounded-2xl outline-none text-red-200 placeholder:text-red-900/30 text-center font-black tracking-widest uppercase"
                placeholder="ELIMINAR TODO"
                value={confirmDeleteAll}
                onChange={(e) => setConfirmDeleteAll(e.target.value)}
              />
            </div>

            <button 
              disabled={confirmDeleteAll !== 'ELIMINAR TODO'}
              onClick={handleNuclearReset}
              className={`w-full p-5 rounded-[2rem] font-black uppercase tracking-widest transition-all ${
                confirmDeleteAll === 'ELIMINAR TODO' 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-2xl shadow-red-900/50 cursor-pointer animate-pulse' 
                : 'bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed'
              }`}
            >
              BORRAR PERMANENTEMENTE TODA LA APP
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}
