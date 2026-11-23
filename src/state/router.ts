import { useSyncExternalStore } from 'react'
import type { Grupo } from '../config/demo.config'

/** Rutas con hash (#/mi-carrera) para que funcionen en hosting estático. */
export const RUTAS = {
  config: '/config',
  inicio: '/',
  miNegocio: '/mi-negocio',
  misGrupos: '/mis-grupos',
  programas: '/programas',
  miCarrera: '/mi-carrera',
  formaciones: '/formaciones',
  chatDirectora: '/chat/directora',
} as const

const RUTAS_POR_GRUPO: Record<Grupo, string[]> = {
  emprendedora: [RUTAS.inicio, RUTAS.miNegocio, RUTAS.misGrupos, RUTAS.programas, RUTAS.miCarrera, RUTAS.chatDirectora],
  directora: [RUTAS.inicio, RUTAS.miNegocio, RUTAS.misGrupos, RUTAS.programas, RUTAS.formaciones],
  lider: [RUTAS.inicio],
}

export function rutaExiste(ruta: string, grupo: Grupo): boolean {
  return RUTAS_POR_GRUPO[grupo].includes(ruta)
}

function leerRuta(): string {
  const hash = window.location.hash.replace(/^#/, '')
  return hash.startsWith('/') ? hash : RUTAS.inicio
}

function suscribir(avisar: () => void): () => void {
  window.addEventListener('hashchange', avisar)
  return () => window.removeEventListener('hashchange', avisar)
}

export function useRuta(): string {
  return useSyncExternalStore(suscribir, leerRuta)
}

export function navegar(ruta: string, opciones: { reemplazar?: boolean } = {}): void {
  if (leerRuta() === ruta) return
  if (opciones.reemplazar) {
    const url = new URL(window.location.href)
    url.hash = ruta
    window.history.replaceState(null, '', url)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = ruta
  }
}
