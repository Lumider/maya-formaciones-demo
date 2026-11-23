import { useEffect } from 'react'
import { ChatSimulado } from '../components/ChatSimulado'
import { directorasHijas, mensajeADirectoraHija } from '../domain/lideres'
import { navegar, RUTAS } from '../state/router'

/** Chat simulado de la Líder con una Directora hija (no abre WhatsApp real). */
export function ChatDirectoraHija({ id }: { id: string }) {
  const directora = directorasHijas().find((d) => d.id === id)

  useEffect(() => {
    if (!directora) navegar(RUTAS.emprendedoras, { reemplazar: true })
  }, [directora])

  if (!directora) return null
  return (
    <ChatSimulado
      chatId={`directora-hija:${directora.id}`}
      contacto={directora.nombre}
      subtitulo={`${directora.estatus} | Hija de ${directora.madre}`}
      mensaje={mensajeADirectoraHija(directora)}
      etiquetaVolver="Volver a Emprendedoras"
      onVolver={() => navegar(RUTAS.emprendedoras)}
    />
  )
}
