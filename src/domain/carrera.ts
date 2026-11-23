import { CONFIG, type Nivel, type Perfil } from '../config/demo.config'
import { minusculaInicial, montoLocal } from './format'

export type EstadoNodo = 'anterior' | 'actual' | 'siguiente' | 'masAdelante'

export interface Sueno {
  /** Chip elegido ("Otro" incluido). */
  opcion: string
  /** Texto tal como lo eligió o escribió. */
  texto: string
  monto: number | null
}

export function indiceNivel(perfil: Perfil): number {
  return CONFIG.niveles.findIndex((n) => n.id === perfil.nivel)
}

export function estadoNodo(indiceNodo: number, indiceActual: number): EstadoNodo {
  if (indiceNodo < indiceActual) return 'anterior'
  if (indiceNodo === indiceActual) return 'actual'
  if (indiceNodo === indiceActual + 1) return 'siguiente'
  return 'masAdelante'
}

export function siguienteNivel(perfil: Perfil): Nivel | null {
  return CONFIG.niveles[indiceNivel(perfil) + 1] ?? null
}

/** Campañas para alcanzar el sueño ganando la cifra de Directora. null si no hay monto. */
export function campanasParaElSueno(monto: number | null): number | null {
  if (!monto || monto <= 0) return null
  // La meta está en la moneda del país; la ganancia del config, en soles.
  return Math.ceil(monto / montoLocal(CONFIG.gananciaDirectora))
}

/** Mensaje precargado de "Habla con tu Directora". */
export function mensajeADirectora(args: {
  nombre: string
  directora: string
  perfil: Perfil
  sueno: Sueno | null
}): string {
  const { nombre, directora, perfil, sueno } = args
  const saludo = `Hola ${directora} 👋 Soy ${nombre}.`
  if (!sueno) {
    return `${saludo} Estuve viendo Mi carrera en Maya y me gustaría que me expliques cómo funciona la carrera Yanbal. Dime cuándo podemos conversar.`
  }
  const siguiente = siguienteNivel(perfil)?.nombre ?? 'Directora'
  return `${saludo} Estuve viendo Mi carrera en Maya y quiero crecer en Yanbal. Mi sueño es ${minusculaInicial(sueno.texto)}. ¿Me ayudas a armar mi plan para llegar a ${siguiente}? Dime cuándo podemos conversar.`
}
