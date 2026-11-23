import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { CONFIG, esSigla, type Perfil, type Sigla } from '../config/demo.config'
import type { Sueno } from '../domain/carrera'

const CLAVE = 'maya-formaciones-demo:v1'

export interface Sesion {
  /** Nombre de la participante: única fuente para saludo, chats y firmas. */
  nombre: string
  /** Directora madre ingresada en la configuración ('' = usar la del config). */
  directora: string
  mostrarPanel: boolean
}

export interface MensajeEnviado {
  texto: string
  hora: string
}

/** Estado propio de cada perfil; cambiar de perfil no borra el de los otros. */
export interface EstadoPerfil {
  sueno: Sueno | null
  /** Mensajes enviados por chat simulado (clave = id del chat). */
  chats: Record<string, MensajeEnviado[]>
  popupBonoVisto: boolean
}

const PERFIL_VACIO: EstadoPerfil = { sueno: null, chats: {}, popupBonoVisto: false }

interface Persistido {
  sesion: Sesion | null
  perfil: Sigla
  porPerfil: Partial<Record<Sigla, EstadoPerfil>>
}

/** Paso del flujo de Mi carrera (hojas inferiores). */
export type Flujo = null | { paso: 'beneficios' | 'sueno' | 'confirmacion'; editando: boolean }

interface Estado extends Persistido {
  flujo: Flujo
  hojasAbiertas: number
  aviso: { id: number; texto: string } | null
}

type Accion =
  | { tipo: 'iniciar'; sesion: Sesion; perfil: Sigla }
  | { tipo: 'reiniciar' }
  | { tipo: 'cambiarPerfil'; perfil: Sigla }
  | { tipo: 'flujo'; flujo: Flujo }
  | { tipo: 'guardarSueno'; sueno: Sueno }
  | { tipo: 'enviarMensaje'; chat: string; mensaje: MensajeEnviado }
  | { tipo: 'hoja'; delta: 1 | -1 }
  | { tipo: 'aviso'; texto: string | null }

function editarPerfil(estado: Estado, cambio: (p: EstadoPerfil) => EstadoPerfil): Estado {
  const actual = estado.porPerfil[estado.perfil] ?? PERFIL_VACIO
  return { ...estado, porPerfil: { ...estado.porPerfil, [estado.perfil]: cambio(actual) } }
}

function reductor(estado: Estado, accion: Accion): Estado {
  switch (accion.tipo) {
    case 'iniciar':
      return { ...estado, sesion: accion.sesion, perfil: accion.perfil, flujo: null }
    case 'reiniciar':
      return { ...estadoInicial(false), perfil: estado.perfil }
    case 'cambiarPerfil':
      return { ...estado, perfil: accion.perfil, flujo: null }
    case 'flujo':
      return { ...estado, flujo: accion.flujo }
    case 'guardarSueno':
      return editarPerfil(estado, (p) => ({ ...p, sueno: accion.sueno }))
    case 'enviarMensaje':
      return editarPerfil(estado, (p) => ({
        ...p,
        chats: { ...p.chats, [accion.chat]: [...(p.chats[accion.chat] ?? []), accion.mensaje] },
      }))
    case 'hoja':
      return { ...estado, hojasAbiertas: Math.max(0, estado.hojasAbiertas + accion.delta) }
    case 'aviso':
      return { ...estado, aviso: accion.texto ? { id: Date.now(), texto: accion.texto } : null }
  }
}

function leerPersistido(): Persistido | null {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return null
    const datos = JSON.parse(crudo) as Persistido
    if (!esSigla(datos.perfil)) return null
    return { sesion: datos.sesion ?? null, perfil: datos.perfil, porPerfil: datos.porPerfil ?? {} }
  } catch {
    return null
  }
}

function estadoInicial(usarGuardado = true): Estado {
  const guardado = usarGuardado ? leerPersistido() : null
  // El perfil también se puede fijar por URL: ?como=CEM
  const como = new URLSearchParams(window.location.search).get('como')?.toUpperCase()
  return {
    sesion: guardado?.sesion ?? null,
    perfil: esSigla(como) ? como : (guardado?.perfil ?? 'CEM'),
    porPerfil: guardado?.porPerfil ?? {},
    flujo: null,
    hojasAbiertas: 0,
    aviso: null,
  }
}

interface Demo {
  sesion: Sesion | null
  sigla: Sigla
  perfil: Perfil
  /** Estado del perfil activo. */
  mio: EstadoPerfil
  /** Directora madre de las Emprendedoras (configurada o la del config). */
  directoraMadre: string
  flujo: Flujo
  hayHojaAbierta: boolean
  aviso: Estado['aviso']
  iniciar(sesion: Sesion, perfil: Sigla): void
  reiniciar(): void
  cambiarPerfil(perfil: Sigla): void
  abrirFlujo(paso: NonNullable<Flujo>['paso'], editando?: boolean): void
  cerrarFlujo(): void
  guardarSueno(sueno: Sueno): void
  enviarMensaje(chat: string, mensaje: MensajeEnviado): void
  registrarHoja(delta: 1 | -1): void
  avisar(texto: string | null): void
}

const Contexto = createContext<Demo | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reductor, undefined, () => estadoInicial())

  useEffect(() => {
    const { sesion, perfil, porPerfil } = estado
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ sesion, perfil, porPerfil } satisfies Persistido))
    } catch {
      // sin localStorage la demo sigue funcionando en memoria
    }
  }, [estado.sesion, estado.perfil, estado.porPerfil]) // eslint-disable-line react-hooks/exhaustive-deps

  const iniciar = useCallback((sesion: Sesion, perfil: Sigla) => despachar({ tipo: 'iniciar', sesion, perfil }), [])
  const reiniciar = useCallback(() => despachar({ tipo: 'reiniciar' }), [])
  const cambiarPerfil = useCallback((perfil: Sigla) => despachar({ tipo: 'cambiarPerfil', perfil }), [])
  const abrirFlujo = useCallback(
    (paso: NonNullable<Flujo>['paso'], editando = false) => despachar({ tipo: 'flujo', flujo: { paso, editando } }),
    [],
  )
  const cerrarFlujo = useCallback(() => despachar({ tipo: 'flujo', flujo: null }), [])
  const guardarSueno = useCallback((sueno: Sueno) => despachar({ tipo: 'guardarSueno', sueno }), [])
  const enviarMensaje = useCallback(
    (chat: string, mensaje: MensajeEnviado) => despachar({ tipo: 'enviarMensaje', chat, mensaje }),
    [],
  )
  const registrarHoja = useCallback((delta: 1 | -1) => despachar({ tipo: 'hoja', delta }), [])
  const avisar = useCallback((texto: string | null) => despachar({ tipo: 'aviso', texto }), [])

  const valor = useMemo<Demo>(
    () => ({
      sesion: estado.sesion,
      sigla: estado.perfil,
      perfil: CONFIG.perfiles[estado.perfil],
      mio: estado.porPerfil[estado.perfil] ?? PERFIL_VACIO,
      directoraMadre: estado.sesion?.directora || CONFIG.directoraPorDefecto,
      flujo: estado.flujo,
      hayHojaAbierta: estado.hojasAbiertas > 0,
      aviso: estado.aviso,
      iniciar,
      reiniciar,
      cambiarPerfil,
      abrirFlujo,
      cerrarFlujo,
      guardarSueno,
      enviarMensaje,
      registrarHoja,
      avisar,
    }),
    [estado, iniciar, reiniciar, cambiarPerfil, abrirFlujo, cerrarFlujo, guardarSueno, enviarMensaje, registrarHoja, avisar],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useDemo(): Demo {
  const demo = useContext(Contexto)
  if (!demo) throw new Error('useDemo debe usarse dentro de <DemoProvider>')
  return demo
}
