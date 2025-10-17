import React, { useEffect, useMemo, useState } from 'react'
import { Car, Clock, DollarSign, TrendingUp, Users, BarChart3, Calendar, Search, Plus, CheckCircle2, AlertCircle, MapPin, FileText, Home } from 'lucide-react'

type TipoVehiculo = { id: number; nombre: string }
type Vehiculo = { id: number; placa: string; fechaHoraEntrada: string; tipoVehiculo?: TipoVehiculo }
type Spot = { id: number; codigo: string; tipo: 'MOTO'|'CARRO'|'ELECTRICO'|'GRANDE'|'DISCAPACIDAD'; estado: 'DISPONIBLE'|'OCUPADO'|'RESERVADO'|'MANTENIMIENTO'; vehiculo?: { placa: string } }

export function ParkingSystemPro(){
  const [activeView, setActiveView] = useState<'dashboard'|'entrada'|'vehiculos'|'mapa'|'reportes'>('dashboard')
  const [vehicles, setVehicles] = useState<Vehiculo[]>([])
  const [types, setTypes] = useState<TipoVehiculo[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [formData, setFormData] = useState<{ placa: string; tipoVehiculoId: string }>({ placa: '', tipoVehiculoId: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const stats = useMemo(() => {
    const ocupados = spots.filter((s: Spot) => s.estado === 'OCUPADO').length
    const disponibles = spots.filter((s: Spot) => s.estado === 'DISPONIBLE').length
    return { activos: vehicles.length, ocupados, disponibles, total: spots.length, ingresos: vehicles.length * 3500 }
  }, [vehicles, spots])

  useEffect(() => {
    loadData()
    const t = setInterval(loadData, 5000)
    return () => clearInterval(t)
  }, [])

  async function loadData(){
    try {
      const [v, t, s] = await Promise.all([
        fetch('/api/vehiculos/activos').then(r=>r.json()),
        fetch('/api/tipos').then(r=>r.json()),
        fetch('/api/spots').then(r=>r.json()),
      ])
      setVehicles(v); setTypes(t); setSpots(s)
    } catch(e){ console.error(e) }
  }

  async function handleSubmit(){
    if(!formData.placa || !formData.tipoVehiculoId){ alert('Completa los campos'); return; }
    setLoading(true)
    try {
      const res = await fetch('/api/vehiculos/entrada', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if(res.ok){ setFormData({ placa:'', tipoVehiculoId:''}); await loadData() } else { alert('Error al registrar') }
    } finally { setLoading(false) }
  }

  async function handleExit(id: number){
    if(!confirm('¿Registrar salida y generar factura?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/vehiculos/${id}/salida`, { method: 'POST' })
      if(res.ok){ const f = await res.json(); alert(`Factura #${f.id} Total: $${f.total.toLocaleString()}`); await loadData() }
    } finally { setLoading(false) }
  }

  const filtered = vehicles.filter((v: Vehiculo) => v.placa?.toLowerCase().includes(searchTerm.toLowerCase()))
  const spotCls = (e: Spot['estado']) => ({
    DISPONIBLE: 'bg-green-100 text-green-800 border-green-300',
    OCUPADO: 'bg-red-100 text-red-800 border-red-300',
    RESERVADO: 'bg-blue-100 text-blue-800 border-blue-300',
    MANTENIMIENTO: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  } as const)[e] || 'bg-gray-100 text-gray-800 border-gray-300'
  const spotIcon = (t: Spot['tipo']) => ({ MOTO:'🏍️', CARRO:'🚗', ELECTRICO:'⚡', GRANDE:'🚙', DISCAPACIDAD:'♿' } as const)[t] || '🅿️'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl">
                  <Car className="text-white" size={32} />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ParqueoSmart Pro</h1>
                <p className="text-sm text-gray-500">Sistema de Gestión Avanzada</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-xl px-3 py-2">
              <Clock className="text-gray-500" size={18} />
              <span className="text-sm font-medium text-gray-700">{new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</span>
              <Calendar className="text-gray-500 ml-3" size={18} />
              <span className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString('es-CO')}</span>
            </div>
          </div>
          <div className="flex space-x-1 pb-4 overflow-x-auto">
            {(
              [
                {id:'dashboard',label:'Dashboard',icon:Home},
                {id:'entrada',label:'Nueva Entrada',icon:Plus},
                {id:'vehiculos',label:'Vehículos Activos',icon:Car},
                {id:'mapa',label:'Mapa de Espacios',icon:MapPin},
                {id:'reportes',label:'Reportes',icon:BarChart3}
              ] as const
            ).map(({id,label,icon:Icon}) => (
              <button key={id} onClick={()=>setActiveView(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${activeView===id? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50':'text-gray-600 hover:bg-gray-100'}`}>
                <Icon size={18}/><span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView==='dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(
                [
                  {label:'Espacios Totales',value:stats.total,icon:MapPin,gradient:'from-blue-500 to-blue-600'},
                  {label:'Disponibles',value:stats.disponibles,icon:CheckCircle2,gradient:'from-green-500 to-green-600'},
                  {label:'Ocupados',value:stats.ocupados,icon:AlertCircle,gradient:'from-orange-500 to-orange-600'},
                  {label:'Ingresos Estimados',value:`$${(stats.ingresos/1000).toFixed(0)}K`,icon:DollarSign,gradient:'from-purple-500 to-purple-600'}
                ] as const
              ).map((stat,idx)=> (
                <div key={idx} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient}`}>
                      <stat.icon className="text-white" size={24}/>
                    </div>
                    <TrendingUp className="text-green-500" size={20}/>
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value as any}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView==='entrada' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl"><Plus className="text-white" size={28}/></div>
                <div><h2 className="text-2xl font-bold text-gray-900">Registrar Nueva Entrada</h2><p className="text-gray-500">Ingresa los datos del vehículo</p></div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Placa del Vehículo</label>
                  <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg font-semibold" value={formData.placa} onChange={e=>setFormData({...formData,placa:e.target.value.toUpperCase()})} placeholder="ABC-123"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Vehículo</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg" value={formData.tipoVehiculoId} onChange={e=>setFormData({...formData,tipoVehiculoId:e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {types.map(t=> <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50">{loading? '...' : 'Registrar Entrada'}</button>
              </div>
            </div>
          </div>
        )}

        {activeView==='vehiculos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center"><Car className="mr-3 text-blue-600" size={28}/>Vehículos en el Parqueadero</h2>
                <div className="flex items-center space-x-2 bg-gray-100 rounded-xl px-4 py-2"><Users className="text-gray-500" size={20}/><span className="font-bold text-gray-900">{vehicles.length}</span></div>
              </div>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                  <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Buscar por placa..." className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"/>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b-2 border-gray-200 bg-gray-50"><th className="text-left py-4 px-4">Placa</th><th className="text-left py-4 px-4">Tipo</th><th className="text-left py-4 px-4">Hora Entrada</th><th className="text-left py-4 px-4">Tiempo</th><th className="text-right py-4 px-4">Acciones</th></tr></thead>
                  <tbody>
                    {filtered.map(v=>{
                      const entrada = new Date(v.fechaHoraEntrada)
                      const mins = Math.max(0, Math.floor((Date.now() - entrada.getTime())/60000))
                      const h = Math.floor(mins/60), m = mins%60
                      return (
                        <tr key={v.id} className="border-b border-gray-100 hover:bg-blue-50">
                          <td className="py-4 px-4"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"><Car className="text-white" size={20}/></div><span className="font-bold text-gray-900 text-lg">{v.placa}</span></div></td>
                          <td className="py-4 px-4"><span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{v.tipoVehiculo?.nombre}</span></td>
                          <td className="py-4 px-4 text-gray-600">{entrada.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</td>
                          <td className="py-4 px-4"><div className="flex items-center space-x-2"><Clock className="text-gray-400" size={16}/><span className="font-semibold text-gray-700">{h}h {m}m</span></div></td>
                          <td className="py-4 px-4 text-right"><button onClick={()=>handleExit(v.id)} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-semibold">Salida</button></td>
                        </tr>)
                    })}
                  </tbody>
                </table>
                {filtered.length===0 && <div className="text-center py-16"><Car className="mx-auto text-gray-300 mb-4" size={64}/><p className="text-gray-500 text-lg font-medium">No hay vehículos en el parqueadero</p></div>}
              </div>
            </div>
          </div>
        )}

        {activeView==='mapa' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-gray-900 flex items-center"><MapPin className="mr-3 text-blue-600" size={28}/>Mapa de Espacios</h2></div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {spots.map(s => (
                  <div key={s.id} className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 cursor-pointer ${spotCls(s.estado)}`} title={`${s.codigo} - ${s.tipo} - ${s.estado}`}>
                    <div className="text-center"><div className="text-2xl mb-1">{spotIcon(s.tipo)}</div><div className="font-bold text-sm">{s.codigo}</div>{s.vehiculo && <div className="text-xs mt-1 font-semibold">{s.vehiculo.placa}</div>}</div>
                  </div>))}
              </div>
            </div>
          </div>
        )}

        {activeView==='reportes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center space-x-4 mb-8"><div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl"><BarChart3 className="text-white" size={28}/></div><div><h2 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h2><p className="text-gray-500">Visualiza el rendimiento del parqueadero</p></div></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {(
                  [
                    {label:'Total Vehículos Hoy',value:vehicles.length,icon:Car},
                    {label:'Tiempo Promedio',value:'2.5h',icon:Clock},
                    {label:'Ingresos del Día',value:`$${(stats.ingresos).toLocaleString()}`,icon:DollarSign}
                  ] as const
                ).map((st,idx)=>(
                  <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4"><st.icon className="text-blue-600" size={32}/><TrendingUp className="text-green-500" size={20}/></div>
                    <p className="text-gray-600 text-sm mb-2">{st.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{st.value}</p>
                  </div>
                ))}
              </div>
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-300"><BarChart3 className="mx-auto text-blue-400 mb-4" size={64}/><h3 className="text-xl font-bold text-gray-900 mb-2">Gráficos Detallados</h3><p className="text-gray-600 mb-4">Accede al sistema completo para ver reportes avanzados</p><a href="/reportes" className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"><FileText size={20}/><span>Ver Reportes Completos</span></a></div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-500 text-sm">© 2025 ParqueoSmart Pro - Sistema de Gestión Profesional</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0"><a href="/historial" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">Historial</a><a href="/tarifas" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">Tarifas</a><a href="/reportes" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">Reportes</a></div>
          </div>
        </div>
      </footer>
    </div>
  )
}
