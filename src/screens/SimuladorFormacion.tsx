import { useEffect, useState } from 'react'
import { EtiquetaPotencial } from '../components/EtiquetaPotencial'
import { NotaLegal } from '../components/NotaLegal'
import { PreguntasPlan } from '../components/PreguntasPlan'
import { CONFIG, type NivelId } from '../config/demo.config'
import { candidatasDe } from '../domain/formaciones'
import { dinero } from '../domain/format'
import { directorasHijas } from '../domain/lideres'
import { primerNombre, type Potencial } from '../domain/potencial'
import { etiquetaCampana, siglaDeNivel, simularPlan } from '../domain/simulador'
import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'
import estrella from '../assets/figma/mi-carrera-sin/node-star-white.svg'
import trofeo from '../assets/figma/mi-carrera-sin/node-trophy.svg'

/** A quién se simula y desde dónde: la Directora a su candidata, o la Líder a una emprendedora. */
interface Caso {
  nombre: string
  nivel: NivelId
  nombreNivel: string
  potencial: Potencial
  /** Solo en la vista de la Líder: la Directora hija que la forma. */
  directoraHija?: { id: string; nombre: string; formacionesPactadas: number }
  rutaVolver: string
  /** Chat simulado en el que se comparte el plan. */
  chat: { id: string; ruta: string; con: string }
}

function useCaso(id: string): Caso | null {
  const { sigla, perfil } = useDemo()
  if (perfil.grupo === 'directora') {
    const c = candidatasDe(sigla).find((x) => x.id === id)
    if (!c) return null
    return {
      nombre: c.nombre,
      nivel: c.nivel,
      nombreNivel: c.nombreNivel,
      potencial: c.potencial,
      rutaVolver: RUTAS.formaciones,
      chat: { id: `candidata:${c.id}`, ruta: RUTAS.chatCandidata + c.id, con: primerNombre(c.nombre) },
    }
  }
  for (const d of directorasHijas()) {
    const e = d.emprendedoras.find((x) => x.id === id)
    if (e) {
      return {
        nombre: e.nombre,
        nivel: e.actual.califica,
        nombreNivel: e.nombreNivel,
        potencial: e.potencial,
        directoraHija: { id: d.id, nombre: d.nombre, formacionesPactadas: d.formacionesPactadas },
        rutaVolver: RUTAS.emprendedoras,
        chat: { id: `directora-hija:${d.id}`, ruta: RUTAS.chatDirectoraHija + d.id, con: primerNombre(d.nombre) },
      }
    }
  }
  return null
}

/**
 * Simulador de formación, para Directoras Junior en adelante: cuándo llegaría la candidata
 * a Directora y qué le toca a quien la acompaña en cada etapa.
 */
export function SimuladorFormacion({ id }: { id: string }) {
  const { dejarBorrador } = useDemo()
  const caso = useCaso(id)
  const [eleccion, setEleccion] = useState<{ ritmo: number; inicio: number } | null>(null)

  useEffect(() => {
    if (!caso) navegar(RUTAS.inicio, { reemplazar: true })
  }, [caso])
  if (!caso) return null

  const corto = primerNombre(caso.nombre)
  const hija = caso.directoraHija
  const sigla = siglaDeNivel(caso.nivel)

  if (!eleccion) {
    return (
      <PreguntasPlan
        sigla={sigla}
        encabezado={
          <div className="simulada">
            <div>
              <span>{caso.nombreNivel}</span>
              <b>{caso.nombre}</b>
              {hija && <span>Directora: {hija.nombre}</span>}
            </div>
            <EtiquetaPotencial potencial={caso.potencial} />
          </div>
        }
        preguntaRitmo={hija ? `¿En cuántas campañas podría llegar ${corto} a Directora?` : `¿En cuántas campañas quieres formar a ${corto}?`}
        preguntaInicio="¿En qué campaña empiezan?"
        ayudaInicio={`Hoy estamos en la campaña C${CONFIG.campana.actual}. El semillero puede ser esta misma semana.`}
        textoFinal="Ver su plan"
        onSalir={() => navegar(caso.rutaVolver)}
        onListo={(ritmo, inicio) => setEleccion({ ritmo, inicio })}
      />
    )
  }

  const plan = simularPlan({ sigla, gananciaActual: null }, eleccion.ritmo, eleccion.inicio, null)
  const llegada = etiquetaCampana(plan.llegada)

  // El mensaje va a la candidata (Directora) o a la Directora hija (Líder). Nunca menciona el bono.
  const compartir = () => {
    const resumen = `sería Directora en ${plan.campanas} campañas empezando en ${etiquetaCampana(plan.inicio)}`
    dejarBorrador({
      chat: caso.chat.id,
      texto: hija
        ? `Hola ${caso.chat.con} 🧡 Simulé el crecimiento de ${caso.nombre}: ${resumen}. ¿Lo revisamos juntas y armamos su plan? ${CONFIG.urls.linkSimulacion}`
        : `Hola ${corto} 👋 Armé tu plan en el simulador: serías Directora en ${plan.campanas} campañas empezando en ${etiquetaCampana(plan.inicio)}. Mira tu camino y cuéntame qué te parece. Lo hacemos juntas: ${CONFIG.urls.linkMiCarrera}`,
    })
    navegar(caso.chat.ruta)
  }

  return (
    <div className="simulador">
      <div className="simulador__barra">
        <button className="regresar" onClick={() => navegar(caso.rutaVolver)}>
          <fry-icon name="chevron-left-outline" size="16" />
          Regresar
        </button>
      </div>

      <span className="simulador__etiqueta">El plan de {corto}</span>
      <h1 className="simulador__pregunta">
        {corto} sería Directora en {llegada}
      </h1>
      <p className="simulador__ayuda">
        Empezando en {etiquetaCampana(plan.inicio)}, su formación toma {plan.campanas} campañas con{' '}
        {hija ? `el acompañamiento de ${primerNombre(hija.nombre)}` : 'tu acompañamiento'}.
      </p>

      <ol className="plan">
        {plan.etapas.map((e) => {
          const esMeta = e.nivel.id === 'directora'
          const voces = CONFIG.simulador.acompanamiento[e.nivel.id]
          return (
            <li className={`plan__paso ${esMeta ? 'plan__paso--meta' : ''}`} key={e.nivel.id}>
              <span className="plan__punto">
                <img src={esMeta ? trofeo : estrella} alt="" />
              </span>
              <div>
                <b>{esMeta ? 'Se forma como Directora' : `Llega a ${e.nivel.nombre}`}</b>
                <p className="plan__cuando">
                  {e.campanas === 1
                    ? `${etiquetaCampana(e.desde)} · 1 campaña`
                    : `De ${etiquetaCampana(e.desde)} a ${etiquetaCampana(e.hasta)} · ${e.campanas} campañas`}
                </p>
                {voces && (
                  <>
                    <p className="plan__voz">
                      <b>Ella</b>
                      {voces.ella}
                    </p>
                    <p className="plan__voz plan__voz--tu">
                      <b>{hija ? 'Su Directora' : 'Tú'}</b>
                      {hija ? voces.suDirectora : voces.tu}
                    </p>
                  </>
                )}
              </div>
            </li>
          )
        })}
        <li className="plan__llegada">
          <b>
            ¡{corto} es Directora desde {llegada}!
          </b>
          {hija ? (
            hija.formacionesPactadas > 0 && (
              <p>Con esta formación, {primerNombre(hija.nombre)} cumple lo que pactó en su plan de negocio.</p>
            )
          ) : (
            <p>
              Recibes tu bono de formación de <b>{dinero(CONFIG.bonoFormacion)}*</b> y ganas una nueva Directora hija.
            </p>
          )}
        </li>
      </ol>

      {!hija && (
        <p className="plan__nota">
          <b>Crecimiento paralelo:</b> cuando {corto} ascienda, sus activas salen de tu Grupo Personal. Planifica
          incorporar en paralelo para que tu grupo no baje.
        </p>
      )}

      <div className="simulador__acciones">
        <fry-button
          hierarchy="primary"
          full-width
          icon-left="whatsapp-outline"
          text={`Compartir este plan con ${caso.chat.con}`}
          onfryClick={compartir}
        />
        <fry-button hierarchy="secondary" full-width text="Cambiar campañas" onfryClick={() => setEleccion(null)} />
      </div>
      {!hija && <NotaLegal tipo="bono" />}
    </div>
  )
}
