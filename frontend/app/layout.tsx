/* SIDEBAR LATERAL IZQUIERDO FIJO OPTIMIZADO */

import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link"; // <--- IMPORTANTE: Importamos Link

export const metadata: Metadata = {
  title: "VTHOME OS",
  description: "Sistema de gestión de suscripciones",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-950 flex min-h-screen font-sans text-[#fdc]">
        {/* SIDEBAR FIJO */}
        <aside className="w-20 md:w-64 bg-slate-900/50 border-r border-slate-800/50 flex flex-col p-4 md:p-6 sticky top-0 h-screen">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex-shrink-0"></div>
            <span className="hidden md:block font-black text-xl tracking-tighter text-blue-500 uppercase">VTHOME</span>
          </div>

          <nav className="flex-1 space-y-2">
            {/* Usamos NavItem que ahora usa Link */}
            <NavItem icon="📊" label="Dashboard" href="/" />
            <NavItem icon="👥" label="Clientes" href="/clientes" />
            <NavItem icon="💰" label="Historial" href="/pagos" />
            <NavItem icon="📦" label="Inventario" href="/inventario" />
            <NavItem icon="⚙️" label="Ajustes" href="/config" />
          </nav>

          <div className="pt-4 border-t border-slate-800/50">
            <Link href="/login" className="flex items-center gap-3 px-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
              <span>🚪</span>
              <span className="hidden md:block text-xs font-bold uppercase">Salir</span>
            </Link>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}

// Subcomponente NavItem optimizado con Link
function NavItem({ icon, label, href }: { icon: string, label: string, href: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-blue-500/10 hover:text-blue-400 transition-all cursor-pointer group"
    >
      <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="hidden md:block text-sm font-bold uppercase tracking-widest">{label}</span>
    </Link>
  );
}
