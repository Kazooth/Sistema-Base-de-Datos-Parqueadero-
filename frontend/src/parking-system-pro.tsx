import React, { useEffect, useMemo, useState } from 'react'
import { Car, Clock, DollarSign, TrendingUp, Users, BarChart3, Calendar, Search, Plus, CheckCircle2, AlertCircle, MapPin, FileText, Home } from 'lucide-react'
import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import Header from './components/Header'
import VehiclesList from './components/VehiclesList'
import MapPanel from './components/MapPanel'

type TipoVehiculo = { id: number; nombre: string }
type Vehiculo = { id: number; placa: string; fechaHoraEntrada: string; tipoVehiculo?: TipoVehiculo }
type Spot = { id: number; codigo: string; tipo: 'MOTO'|'CARRO'|'ELECTRICO'|'GRANDE'|'DISCAPACIDAD'; estado: 'DISPONIBLE'|'OCUPADO'|'RESERVADO'|'MANTENIMIENTO'; vehiculo?: { placa: string } }

function ParkingSystemPro(){
  const [activeView, setActiveView] = useState<'dashboard'|'entrada'|'vehiculos'|'mapa'|'reportes'|'historial'|'tarifas'>('dashboard')
  const [vehicles, setVehicles] = useState<Vehiculo[]>([])
  const [types, setTypes] = useState<TipoVehiculo[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [selected, setSelected] = useState<Spot | null>(null)
  const [formData, setFormData] = useState<{ placa: string; tipoVehiculoId: string }>({ placa: '', tipoVehiculoId: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  // Pagination (client-side): page index starts at 1
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const stats = useMemo(() => {
    const ocupados = spots.filter((s: Spot) => s.estado === 'OCUPADO').length
    const disponibles = spots.filter((s: Spot) => s.estado === 'DISPONIBLE').length
    return { activos: totalItems, ocupados, disponibles, total: spots.length, ingresos: totalItems * 3500 }
  }, [totalItems, spots])

  useEffect(() => {
    loadData()
    const t = setInterval(loadData, 5000)
    return () => clearInterval(t)
  }, [page, pageSize])

  // WebSocket: live updates for spots
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      debug: () => {}
    })
    client.onConnect = () => {
      client.subscribe('/topic/spots', (msg: IMessage) => {
        try {
          const updated: Spot = JSON.parse(msg.body)
          setSpots(prev => {
            const idx = prev.findIndex(s => s.id === updated.id)
            if (idx === -1) return prev
            const copy = prev.slice()
            copy[idx] = { ...copy[idx], ...updated }
            return copy
          })
        } catch (e) { console.error('WS parse error', e) }
      })
    }
    client.activate()
    return () => { try { client.deactivate() } catch {} }
  }, [])

  async function loadData(){
    try {
      const [vehiclesRes, typesRes, spotsRes] = await Promise.all([
        fetch(`/api/vehiculos/activos?page=${Math.max(0, page-1)}&size=${pageSize}`),
        fetch('/api/tipos'),
        fetch('/api/spots')
      ])

      const vehiclesData = await vehiclesRes.json()
      const typesData = await typesRes.json()
      const spotsData = await spotsRes.json()

      setVehicles(Array.isArray(vehiclesData.content) ? vehiclesData.content : vehiclesData)
      setTypes(typesData)
      setSpots(spotsData)

      // If server returned a Page object, use its metadata
      if (vehiclesData && typeof vehiclesData.totalElements === 'number') {
        setTotalItems(vehiclesData.totalElements)
        setTotalPages(vehiclesData.totalPages || 1)
      } else {
        setTotalItems(Array.isArray(vehiclesData) ? vehiclesData.length : 0)
        setTotalPages(Math.max(1, Math.ceil((Array.isArray(vehiclesData) ? vehiclesData.length : 0) / pageSize)))
      }
    } catch(e){ console.error(e) }
  }

  async function spotAction(id: number, action: 'reservar'|'mantenimiento'|'liberar'){
    try {
      const res = await fetch(`/api/spots/${id}/${action}`, { method: 'POST' })
      if (res.ok) {
        // Try to use returned spot if present
        try {
          const updated: Spot = await res.json()
          setSpots(prev => {
            const idx = prev.findIndex(s => s.id === updated.id)
            if (idx === -1) return prev
            const copy = prev.slice(); copy[idx] = { ...copy[idx], ...updated }; return copy
          })
        } catch {
          await loadData()
        }
      } else {
        alert('No se pudo ejecutar la acción del espacio')
      }
    } catch (e) { console.error(e) }
  }

  async function ocupar(id: number){
    if (!formData.placa || !formData.tipoVehiculoId) { alert('Placa y tipo de vehículo son requeridos'); return }
    setLoading(true)
    try {
      const payload = { placa: formData.placa, tipoVehiculoId: Number(formData.tipoVehiculoId) }
      const res = await fetch(`/api/spots/${id}/ocupar`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        // actualizar UI
        try {
          const updated: Spot = await res.json()
          setSpots(prev => {
            const idx = prev.findIndex(s => s.id === updated.id)
            if (idx === -1) return prev
            const copy = prev.slice(); copy[idx] = { ...copy[idx], ...updated }; return copy
          })
        } catch { await loadData() }
        setSelected(null)
        setFormData({ placa: '', tipoVehiculoId: '' })
      } else {
        const msg = await res.text()
        alert(`Error al ocupar: ${msg}`)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
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
  // If searchTerm is active, perform client-side filter on current page items
  const paginated = searchTerm ? filtered : vehicles
  useEffect(() => { if (page > totalPages) setPage(totalPages) }, [totalPages])
  const spotCls = (e: Spot['estado']) => ({
    DISPONIBLE: 'bg-green-100 text-green-800 border-green-300',
    OCUPADO: 'bg-red-100 text-red-800 border-red-300',
    RESERVADO: 'bg-blue-100 text-blue-800 border-blue-300',
    MANTENIMIENTO: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  } as const)[e] || 'bg-gray-100 text-gray-800 border-gray-300'
  const spotIcon = (t: Spot['tipo']) => ({ MOTO:'🏍️', CARRO:'🚗', ELECTRICO:'⚡', GRANDE:'🚙', DISCAPACIDAD:'♿' } as const)[t] || '🅿️'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header activeView={activeView} setActiveView={setActiveView} />

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
          <VehiclesList vehicles={vehicles} totalItems={totalItems} page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleExit={handleExit} loading={loading} totalPages={totalPages} />
        )}

        {activeView==='mapa' && (
          <MapPanel spots={spots} selected={selected} setSelected={setSelected} formData={formData} setFormData={setFormData} types={types} ocupar={ocupar} spotAction={spotAction} loading={loading} />
        )}

        {activeView==='historial' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center"><FileText className="mr-3 text-blue-600" size={28}/>Historial</h2>
                <a href="/historial" className="text-sm text-blue-600 hover:underline" target="_blank" rel="noreferrer">Abrir en nueva pestaña</a>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden" style={{height: '80vh'}}>
                <iframe title="Historial" src="/historial" className="w-full h-full bg-white"/>
              </div>
            </div>
          </div>
        )}

        {activeView==='tarifas' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center"><DollarSign className="mr-3 text-blue-600" size={28}/>Tarifas</h2>
                <a href="/tarifas" className="text-sm text-blue-600 hover:underline" target="_blank" rel="noreferrer">Abrir en nueva pestaña</a>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden" style={{height: '80vh'}}>
                <iframe title="Tarifas" src="/tarifas" className="w-full h-full bg-white"/>
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
                    {label:'Total Vehículos Hoy',value:totalItems,icon:Car},
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
              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="font-semibold text-gray-800">Reportes en vivo</div>
                  <a href="/reportes" className="text-sm text-blue-600 hover:underline" target="_blank" rel="noreferrer">Abrir en nueva pestaña</a>
                </div>
                <iframe title="Reportes" src="/reportes" className="w-full" style={{height:'80vh'}}/>
              </div>
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
export default ParkingSystemPro
