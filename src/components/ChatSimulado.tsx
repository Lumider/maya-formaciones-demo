import { useEffect, useRef, useState } from 'react'
import { horaChat } from '../domain/format'
import { useDemo } from '../state/store'
import atras from '../assets/figma/whatsapp/chevron-left.svg'
import video from '../assets/figma/whatsapp/icon-video-call.svg'
import llamada from '../assets/figma/whatsapp/icon-audio-call.svg'
import cola from '../assets/figma/whatsapp/bubble-tail.svg'
import dobleCheck from '../assets/figma/whatsapp/checkmark-double.svg'
import mas from '../assets/figma/whatsapp/icon-plus.svg'
import adjunto from '../assets/figma/whatsapp/icon-attachment.svg'
import camara from '../assets/figma/whatsapp/icon-camera.svg'
import microfono from '../assets/figma/whatsapp/icon-microphone.svg'

interface Props {
  /** Identificador del chat dentro del perfil activo (para recordar lo enviado). */
  chatId: string
  contacto: string
  subtitulo: string
  /** Mensaje que llega ya escrito en la caja de texto. */
  mensaje: string
  etiquetaVolver: string
  onVolver: () => void
  /** Se llama al enviar el mensaje (p. ej. para acompañarlo con un sonido). */
  alEnviar?: () => void
}

/**
 * Pantalla que simula un chat de WhatsApp dentro de la demo.
 * Nunca abre WhatsApp real ni envía mensajes de verdad.
 */
export function ChatSimulado({ chatId, contacto, subtitulo, mensaje, etiquetaVolver, onVolver, alEnviar }: Props) {
  const { mio, enviarMensaje } = useDemo()
  const enviados = mio.chats[chatId] ?? []
  const ultimo = enviados[enviados.length - 1]
  // La caja queda vacía tras enviar; si el mensaje cambió (p. ej. editó su sueño), vuelve a precargarse.
  const [borrador, setBorrador] = useState(ultimo?.texto === mensaje ? '' : mensaje)
  const [recienEnviado, setRecienEnviado] = useState(false)
  const finRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'end' })
  }, [enviados.length])

  const enviar = () => {
    if (!borrador) return
    enviarMensaje(chatId, { texto: borrador, hora: horaChat(new Date()) })
    setBorrador('')
    setRecienEnviado(true)
    alEnviar?.()
  }

  return (
    <div className="chat">
      <header className="chat__barra">
        <button className="chat__atras" onClick={onVolver} aria-label="Volver">
          <img src={atras} alt="" width={12} height={20} />
        </button>
        <span className="chat__avatar" aria-hidden="true">
          {contacto.charAt(0).toUpperCase()}
        </span>
        <span className="chat__contacto">
          <b>{contacto}</b>
          <span>{subtitulo}</span>
        </span>
        <img src={video} alt="" width={24} height={24} />
        <img src={llamada} alt="" width={24} height={24} />
      </header>

      <div className="chat__mensajes">
        <span className="chat__fecha">Hoy</span>
        {enviados.map((m, i) => (
          <div className="burbuja" key={i}>
            <div className="burbuja__cuerpo">
              <p>{m.texto}</p>
              <span className="burbuja__meta">
                {m.hora}
                <img src={dobleCheck} alt="Entregado" width={15} height={14} />
              </span>
            </div>
            <img className="burbuja__cola" src={cola} alt="" width={8} height={15} />
          </div>
        ))}
        <div ref={finRef} />
      </div>

      {recienEnviado && (
        <div className="chat__volver">
          <fry-button hierarchy="primary" size="medium" text={etiquetaVolver} onfryClick={onVolver} />
        </div>
      )}

      <footer className="chat__entrada">
        <img src={mas} alt="" width={24} height={24} />
        <div className="chat__caja" aria-label="Mensaje">
          <p>{borrador}</p>
          {!borrador && <img src={adjunto} alt="" width={24} height={24} />}
        </div>
        {borrador ? (
          <button className="chat__enviar" onClick={enviar} aria-label="Enviar mensaje">
            <fry-icon name="send-filled" size="20" color="#ffffff" />
          </button>
        ) : (
          <>
            <img src={camara} alt="" width={24} height={24} />
            <img src={microfono} alt="" width={24} height={24} />
          </>
        )}
      </footer>
    </div>
  )
}
