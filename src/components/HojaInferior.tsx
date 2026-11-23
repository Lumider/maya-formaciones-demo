import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useDemo } from '../state/store'
import { useCapa } from './Capa'

interface Props {
  /** Se llama al tocar el fondo, la X o Escape. */
  onCerrar: () => void
  /** Muestra la X en la esquina superior derecha. */
  conCerrar?: boolean
  etiqueta: string
  /** Bloque fijo sobre el contenido desplazable (foto, video, título). */
  cabecera?: ReactNode
  pie?: ReactNode
  children: ReactNode
  className?: string
}

/** Hoja inferior (bottom sheet) sobre la pantalla de origen. */
export function HojaInferior({ onCerrar, conCerrar = false, etiqueta, cabecera, pie, children, className }: Props) {
  const capa = useCapa()
  const { registrarHoja } = useDemo()

  // Mientras haya una hoja abierta, el panel "Ver como" se oculta.
  useEffect(() => {
    registrarHoja(1)
    return () => registrarHoja(-1)
  }, [registrarHoja])

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [onCerrar])

  if (!capa) return null
  return createPortal(
    <>
      <div className="hoja-fondo" onClick={onCerrar} />
      <section className={`hoja ${className ?? ''}`} role="dialog" aria-modal="true" aria-label={etiqueta}>
        {conCerrar && (
          <button className="hoja__cerrar" onClick={onCerrar} aria-label="Cerrar">
            <fry-icon name="close-outline" />
          </button>
        )}
        {cabecera && <div className="hoja__cabecera">{cabecera}</div>}
        <div className="hoja__cuerpo">{children}</div>
        {pie && <div className="hoja__pie">{pie}</div>}
      </section>
    </>,
    capa,
  )
}
