
import React, { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import graph from '../data/graph.json'


delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})


function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function MapView({
  startNodeId,
  endNodeId,
  setStartNodeId,
  setEndNodeId,
  shortest,
  fastest,
}) {
  const center = [20.29606, 85.82454]
  const nodes = useMemo(() => graph.nodes, [])

  function MapClick() {
    useMapEvents({
      click(e) {
        const lat = e.latlng.lat
        const lng = e.latlng.lng

        let best = null
        let bestD = Infinity
        for (const n of nodes) {
          const d = haversineKm(lat, lng, n.lat, n.lng)
          if (d < bestD) {
            bestD = d
            best = n
          }
        }
        if (!best) return

        if (!startNodeId) setStartNodeId(best.id)
        else if (!endNodeId) setEndNodeId(best.id)
        else {
          setStartNodeId(best.id)
          setEndNodeId(null)
        }
      },
    })
    return null
  }

  function idToLatLng(id) {
    const n = nodes.find(x => x.id === id)
    return n ? [n.lat, n.lng] : null
  }

  return (
    <MapContainer center={center} zoom={14} className="leaflet-container">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClick />


      {nodes.map(n => (
        <CircleMarker key={n.id} center={[n.lat, n.lng]} radius={3} pathOptions={{ color: '#777' }} />
      ))}


      {startNodeId && (() => {
        const pos = idToLatLng(startNodeId)
        return pos ? <Marker key="start" position={pos} /> : null
      })()}
      {endNodeId && (() => {
        const pos = idToLatLng(endNodeId)
        return pos ? <Marker key="end" position={pos} /> : null
      })()}

      {/* paths */}
      {shortest && shortest.path && (
        <Polyline positions={shortest.path.map(id => idToLatLng(id))} pathOptions={{ color: 'blue', weight: 5 }} />
      )}
      {fastest && fastest.path && (
        <Polyline positions={fastest.path.map(id => idToLatLng(id))} pathOptions={{ color: 'red', weight: 5, dashArray: '8' }} />
      )}
    </MapContainer>
  )
}
