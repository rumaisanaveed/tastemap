import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { pinIcon } from '@/lib/map'
import { TILE_ATTRIBUTION, TILE_URL } from './MapView/MapView'

type LngLat = [number, number]

function Helpers({ value, onChange }: { value: LngLat; onChange: (v: LngLat) => void }) {
  const map = useMap()
  useMapEvents({ click: (e) => onChange([e.latlng.lng, e.latlng.lat]) })
  useEffect(() => { const t = setTimeout(() => map.invalidateSize(), 250); return () => clearTimeout(t) }, [map])
  useEffect(() => { map.panTo([value[1], value[0]]) }, [value, map])
  return null
}

export default function LocationPicker({ value, onChange }: { value: LngLat; onChange: (v: LngLat) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border-[1.5px] border-input">
      <MapContainer center={[value[1], value[0]]} zoom={14} zoomControl={false} className="h-44 w-full">
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <Marker
          position={[value[1], value[0]]}
          icon={pinIcon('', 'ranked', true)}
          draggable
          eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); onChange([p.lng, p.lat]) } }}
        />
        <Helpers value={value} onChange={onChange} />
      </MapContainer>
    </div>
  )
}
