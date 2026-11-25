import L from 'leaflet'

export const DEFAULT_CENTER: [number, number] = [67.03, 24.85]

export function pinIcon(label: string, kind: 'ranked' | 'want', selected: boolean) {
  const size = selected ? 52 : kind === 'ranked' ? 34 : 24
  return L.divIcon({
    className: 'tm-icon',
    html: `<div class="tm-pin ${kind === 'ranked' ? 'tm-ranked' : 'tm-want'} ${selected ? 'tm-sel' : ''}">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}
