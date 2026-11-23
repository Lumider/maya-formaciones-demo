import { CONFIG, type Intencion, type Metricas } from '../config/demo.config'

/**
 * Reglas compartidas por las Partes B y C: potencial e intención.
 * Todo se calcula de los datos y de los umbrales del config.
 */
export type Potencial = 'alto' | 'medio' | 'bajo' | 'sin'

export const ORDEN_POTENCIAL: Potencial[] = ['alto', 'medio', 'bajo', 'sin']

export const ETIQUETA_POTENCIAL: Record<Potencial, string> = {
  alto: 'Potencial alto',
  medio: 'Potencial medio',
  bajo: 'Potencial bajo',
  sin: 'Sin potencial',
}

/** Orden de prioridad para decir qué le falta a quien no cumple. */
const PRIORIDAD_FALTANTE: (keyof Metricas)[] = ['pped', 'activas', 'ventaGP']

export function cumpleVariable(m: Metricas, variable: keyof Metricas): boolean {
  return m[variable] >= CONFIG.umbrales[variable]
}

/** Cumple cuando alcanza los tres umbrales: Venta GP, Activas y PPED. */
export function cumple(m: Metricas): boolean {
  return PRIORIDAD_FALTANTE.every((v) => cumpleVariable(m, v))
}

export function potencial(m: Metricas, intencion: Intencion): Potencial {
  const quiere = intencion === 'quiere'
  if (cumple(m)) return quiere ? 'alto' : 'medio'
  return quiere ? 'bajo' : 'sin'
}

/** Primera variable que no cumple, por prioridad (PPED → Activas → Venta GP). */
export function primerFaltante(m: Metricas): keyof Metricas | null {
  return PRIORIDAD_FALTANTE.find((v) => !cumpleVariable(m, v)) ?? null
}

export const TEXTO_INTENCION: Record<Intencion, string> = {
  quiere: 'Intención: 🧡 Quiere ser Directora',
  aunNoDecide: 'Intención: Aún no decide',
  noRegistro: 'Intención: No registró',
}

export function primerNombre(nombreCompleto: string): string {
  return nombreCompleto.trim().split(/\s+/)[0]
}

/** Sigla que espera el simulador externo para cada nivel de carrera. */
const SIGLA_NIVEL: Record<string, string> = { consultora: 'CNS', cem: 'CEM', cemSenior: 'CES' }

/**
 * Enlace al simulador de formación con los datos de la candidata o emprendedora.
 * Solo lleva datos mock de la demo; el bono viaja porque el simulador es para la Directora.
 */
export function enlaceSimuladorFormacion(datos: {
  /** Solo nombres mock del config: el nombre real de la participante no viaja en la URL. */
  directora?: string
  nombre: string
  nivel: string
  metricas: Metricas
  potencial: Potencial
  intencion: Intencion
  sueno?: string | null
}): string {
  const p = new URLSearchParams({
    bono: String(CONFIG.bonoFormacion),
    nombre: datos.nombre,
    nivel: SIGLA_NIVEL[datos.nivel] ?? 'CES',
    venta_gp: String(datos.metricas.ventaGP),
    activas: String(datos.metricas.activas),
    pped: String(datos.metricas.pped),
    // El simulador solo conoce alto, medio y bajo.
    potencial: datos.potencial === 'sin' ? 'bajo' : datos.potencial,
    interes: datos.intencion === 'quiere' ? '1' : '0',
    sueno: datos.sueno ?? '',
  })
  if (datos.directora) p.set('dir_nombre', datos.directora)
  return `${CONFIG.urls.simuladorDirUrl}?${p.toString()}`
}
