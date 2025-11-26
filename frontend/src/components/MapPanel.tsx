import React from 'react'
import { MapPin } from 'lucide-react'
import { Spot, TipoVehiculo } from '../types'

type Props = {
  spots: Spot[]
  selected: Spot | null
  setSelected: (s: Spot | null)=>void
  formData: { placa: string; tipoVehiculoId: string }
  setFormData: (f:any)=>void
  types: TipoVehiculo[]
  ocupar: (id:number)=>void
  spotAction: (id:number, action:'reservar'|'mantenimiento'|'liberar')=>void
  loading: boolean
}

const spotCls = (e: Spot['estado']) => ({
  DISPONIBLE: 'bg-green-100 text-green-800 border-green-300',
  OCUPADO: 'bg-red-100 text-red-800 border-red-300',
  RESERVADO: 'bg-blue-100 text-blue-800 border-blue-300',
  MANTENIMIENTO: 'bg-yellow-100 text-yellow-800 border-yellow-300'
} as const)[e] || 'bg-gray-100 text-gray-800 border-gray-300'
const spotIcon = (t: Spot['tipo']) => ({ MOTO:'🏍️', CARRO:'🚗', ELECTRICO:'⚡', GRANDE:'🚙', DISCAPACIDAD:'♿' } as const)[t] || '🅿️'

export default function MapPanel({ spots, selected, setSelected, formData, setFormData, types, ocupar, spotAction, loading }: Props){
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-gray-900 flex items-center"><MapPin className="mr-3 text-blue-600" size={28}/>Mapa de Espacios</h2></div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
           {spots.map(s => (
            <div key={s.id} onClick={()=>{ setSelected(s); setFormData({ placa: s.vehiculo?.placa ?? '', tipoVehiculoId: '' }) }} className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 cursor-pointer ${spotCls(s.estado)}`} title={`${s.codigo} - ${s.tipo} - ${s.estado}`}>
              <div className="text-center"><div className="text-2xl mb-1">{spotIcon(s.tipo)}</div><div className="font-bold text-sm">{s.codigo}</div>{s.vehiculo && <div className="text-xs mt-1 font-semibold">{s.vehiculo.placa}</div>}</div>
            </div>))}
        </div>
        {selected && (
          <div className="mt-6 bg-gray-50 rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{spotIcon(selected.tipo)}</div>
                <div>
                  <div className="font-bold text-gray-900">Espacio {selected.codigo}</div>
                  <div className="text-sm text-gray-600">{selected.tipo} · {selected.estado}{selected.vehiculo? ` · ${selected.vehiculo.placa}`:''}</div>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} className="text-sm text-gray-500 hover:text-blue-600">Cerrar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <button onClick={()=>spotAction(selected.id,'reservar')} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-blue-50">Reservar</button>
              <button onClick={()=>spotAction(selected.id,'mantenimiento')} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-blue-50">Mantenimiento</button>
              <button onClick={()=>spotAction(selected.id,'liberar')} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-blue-50">Liberar</button>
              <button onClick={()=>{ const el=document.getElementById('ocuparPlaca'); el?.focus() }} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-blue-50">Ocupar con placa</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Placa</label>
                <input id="ocuparPlaca" value={formData.placa} onChange={e=>setFormData({...formData, placa:e.target.value.toUpperCase()})} className="w-full px-3 py-2 border rounded-lg" placeholder="ABC123"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Tipo Vehículo</label>
                <select value={formData.tipoVehiculoId} onChange={e=>setFormData({...formData, tipoVehiculoId:e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Seleccionar...</option>
                  {types.map(t=> <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>ocupar(selected.id)} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">{loading? 'Ocupando...' : 'Ocupar'}</button>
                <button onClick={()=>setSelected(null)} className="flex-1 border border-gray-200 px-4 py-2 rounded-lg">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
