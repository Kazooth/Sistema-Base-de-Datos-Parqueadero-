import React from 'react'
import { Car, Clock } from 'lucide-react'
import { Vehiculo } from '../types'
import Pagination from './Pagination'

type Props = {
  vehicles: Vehiculo[]
  totalItems: number
  page: number
  setPage: (n:number)=>void
  pageSize: number
  setPageSize: (n:number)=>void
  searchTerm: string
  setSearchTerm: (s:string)=>void
  handleExit: (id:number)=>void
  loading: boolean
  totalPages: number
}

export default function VehiclesList({ vehicles, totalItems, page, setPage, pageSize, setPageSize, searchTerm, setSearchTerm, handleExit, loading, totalPages }: Props){
  const filtered = vehicles.filter(v => v.placa?.toLowerCase().includes(searchTerm.toLowerCase()))
  const paginated = searchTerm ? filtered : vehicles

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center"><Car className="mr-3 text-blue-600" size={28}/>Vehículos en el Parqueadero</h2>
          <div className="flex items-center space-x-2 bg-gray-100 rounded-xl px-4 py-2"><span className="font-bold text-gray-900">{totalItems}</span></div>
        </div>
        <div className="mb-6">
          <div className="relative">
            <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Buscar por placa..." className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b-2 border-gray-200 bg-gray-50"><th className="text-left py-4 px-4">Placa</th><th className="text-left py-4 px-4">Tipo</th><th className="text-left py-4 px-4">Hora Entrada</th><th className="text-left py-4 px-4">Tiempo</th><th className="text-right py-4 px-4">Acciones</th></tr></thead>
            <tbody>
              {paginated.map(v=>{
                const entrada = new Date(v.fechaHoraEntrada)
                const mins = Math.max(0, Math.floor((Date.now() - entrada.getTime())/60000))
                const h = Math.floor(mins/60), m = mins%60
                return (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-blue-50">
                    <td className="py-4 px-4"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"><Car className="text-white" size={20}/></div><span className="font-bold text-gray-900 text-lg">{v.placa}</span></div></td>
                    <td className="py-4 px-4"><span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{v.tipoVehiculo?.nombre}</span></td>
                    <td className="py-4 px-4 text-gray-600">{entrada.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</td>
                    <td className="py-4 px-4"><div className="flex items-center space-x-2"><Clock className="text-gray-400" size={16}/><span className="font-semibold text-gray-700">{h}h {m}m</span></div></td>
                    <td className="py-4 px-4 text-right"><button onClick={()=>handleExit(v.id)} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg">Salida</button></td>
                  </tr>)
              })}
            </tbody>
          </table>
          {totalItems===0 && <div className="text-center py-16"><Car className="mx-auto text-gray-300 mb-4" size={64}/><p className="text-gray-500 text-lg font-medium">No hay vehículos en el parqueadero</p></div>}

          <Pagination page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} totalItems={totalItems} totalPages={totalPages} />
        </div>
      </div>
    </div>
  )
}
