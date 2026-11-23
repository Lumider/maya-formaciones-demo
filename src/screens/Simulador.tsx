import { useState } from 'react'
import { NotaLegal } from '../components/NotaLegal'
import { CONFIG } from '../config/demo.config'
import { indiceNivel } from '../domain/carrera'
import { soles } from '../domain/format'
import { etiquetaCampana, ritmosDe, simularPlan } from '../domain/simulador'
import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'
import { HojaNivel } from './carrera/HojaNivel'
import estrella from '../assets/figma/mi-carrera-sin/node-star-white.svg'
import check from '../assets/figma/mi-carrera-sin/node-check-white.svg'
import trofeo from '../assets/figma/mi-carrera-sin/node-trophy.svg'
import trofeoSueno from '../assets/figma/mi-carrera-sin/award.png'

type Paso = 'ritmo' | 'inicio' | 'plan'

/**
 * Simulador de carrera para Emprendedoras (CNS, CEM, CEM Senior).
 * Pensado para usuarias poco digitales: una pregunta por pantalla, opciones grandes,
 * nada que escribir y sin volver a pedir lo que Maya ya sabe (nivel y sueño).
 */
export function Simulador() {
  const { sigla, perfil, mio } = useDemo()
  const [paso, setPaso] = useState<Paso>('ritmo')
  const [ritmo, setRitmo] = useState<number | null>(null)
  const [inicio, setInicio] = useState<number | null>(null)
  const [nivelAbierto, setNivelAbierto] = useState<number | null>(null)

  const ritmos = ritmosDe(sigla)
  const { actual } = CONFIG.campana
  const inicios = CONFIG.simulador.inicios.map((etiqueta, i) => ({ etiqueta, campana: actual + i }))
  const nivelActual = CONFIG.niveles[indiceNivel(perfil)]
  const sueno = mio.sueno

  const hablarConDirectora = () => navegar(RUTAS.chatDirectora)

  if (paso !== 'plan' || ritmo === null || inicio === null) {
    const enRitmo = paso === 'ritmo'
    return (
      <div className="simulador">
        <div className="simulador__barra">
          <button className="regresar" onClick={() => (enRitmo ? navegar(RUTAS.miCarrera) : setPaso('ritmo'))}>
            <fry-icon name="chevron-left-outline" size="16" />
            {enRitmo ? 'Regresar' : 'Atrás'}
          </button>
          <span>Paso {enRitmo ? 1 : 2} de 2</span>
        </div>

        {enRitmo ? (
          <>
            <h1 className="simulador__pregunta">¿En cuántas campañas quieres llegar a Directora?</h1>
            <p className="simulador__ayuda">
              Una campaña dura 4 semanas. {CONFIG.simulador.campanasPorAnio} campañas son un año.
            </p>
            <div className="simulador__opciones" role="radiogroup" aria-label="Campañas para llegar a Directora">
              {ritmos.map((r, i) => (
                <button
                  key={r}
                  role="radio"
                  aria-checked={ritmo === r}
                  className={`opcion ${ritmo === r ? 'opcion--elegida' : ''}`}
                  onClick={() => setRitmo(r)}
                >
                  <span className="opcion__grande">{r}</span>
                  <span className="opcion__texto">
                    <b>campañas</b>
                    <span>{CONFIG.simulador.etiquetasRitmo[i]}</span>
                  </span>
                  <span className="opcion__marca" aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="simulador__pie">
              <fry-button hierarchy="primary" full-width text="Continuar" disabled={ritmo === null} onfryClick={() => setPaso('inicio')} />
            </div>
          </>
        ) : (
          <>
            <h1 className="simulador__pregunta">¿Cuándo quieres empezar?</h1>
            <p className="simulador__ayuda">Hoy estamos en la campaña C{actual}. Empezar ahora cuenta.</p>
            <div className="simulador__opciones" role="radiogroup" aria-label="Campaña de inicio">
              {inicios.map((o) => (
                <button
                  key={o.campana}
                  role="radio"
                  aria-checked={inicio === o.campana}
                  className={`opcion ${inicio === o.campana ? 'opcion--elegida' : ''}`}
                  onClick={() => setInicio(o.campana)}
                >
                  <span className="opcion__grande">{etiquetaCampana(o.campana).split(' ')[0]}</span>
                  <span className="opcion__texto">
                    <b>{o.etiqueta}</b>
                    {etiquetaCampana(o.campana).includes('(') && <span>{etiquetaCampana(o.campana).split(' ')[1]}</span>}
                  </span>
                  <span className="opcion__marca" aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="simulador__pie">
              <fry-button hierarchy="primary" full-width text="Ver mi plan" disabled={inicio === null} onfryClick={() => setPaso('plan')} />
            </div>
          </>
        )}
      </div>
    )
  }

  const plan = simularPlan(perfil, ritmo, inicio, sueno?.monto ?? null)

  return (
    <div className="simulador">
      <div className="simulador__barra">
        <button className="regresar" onClick={() => navegar(RUTAS.miCarrera)}>
          <fry-icon name="chevron-left-outline" size="16" />
          Regresar
        </button>
      </div>

      <span className="simulador__etiqueta">Tu plan</span>
      <h1 className="simulador__pregunta">Serías Directora en {etiquetaCampana(plan.llegada)}</h1>
      <p className="simulador__ayuda">
        Empiezas en {etiquetaCampana(plan.inicio)} y llegas en {plan.campanas} campañas, paso a paso.
      </p>

      <ol className="plan">
        <li className="plan__paso plan__paso--hoy">
          <span className="plan__punto">
            <img src={check} alt="" />
          </span>
          <div>
            <b>Hoy · {nivelActual.nombre}</b>
            {perfil.gananciaActual !== null && <p>Tu ganancia estimada: {soles(perfil.gananciaActual)} por campaña</p>}
          </div>
        </li>
        {plan.etapas.map((e) => {
          const esMeta = e.nivel.id === 'directora'
          return (
            <li className={`plan__paso ${esMeta ? 'plan__paso--meta' : ''}`} key={e.nivel.id}>
              <span className="plan__punto">
                <img src={esMeta ? trofeo : estrella} alt="" />
              </span>
              <div>
                <b>{esMeta ? 'Fórmate y sé Directora' : `Llega a ${e.nivel.nombre}`}</b>
                <p className="plan__cuando">
                  {e.campanas === 1
                    ? `${etiquetaCampana(e.desde)} · 1 campaña`
                    : `De ${etiquetaCampana(e.desde)} a ${etiquetaCampana(e.hasta)} · ${e.campanas} campañas`}
                </p>
                <p>Mientras tanto ganarías {soles(e.ganancia)} por campaña*</p>
                <button className="plan__enlace" onClick={() => setNivelAbierto(e.indiceNivel)}>
                  Ver qué necesitas
                </button>
              </div>
            </li>
          )
        })}
        <li className="plan__llegada">
          <b>¡Directora desde {etiquetaCampana(plan.llegada)}!</b>
          <p>
            Ganarías <b>desde {soles(CONFIG.gananciaDirectora)} por campaña*</b>
          </p>
        </li>
      </ol>

      {sueno && (
        <div className="plan__sueno">
          <img src={trofeoSueno} alt="" />
          <div>
            <b>Tu sueño: {sueno.texto}</b>
            {sueno.monto !== null && plan.campanaMeta !== null && (
              <p>
                Con este plan juntarías tu meta de {soles(sueno.monto)} en <b>{etiquetaCampana(plan.campanaMeta)}</b>
                {plan.campanaMeta < plan.llegada ? ', antes de ser Directora.' : ', ya como Directora.'}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="simulador__acciones">
        <p>No vas sola: arma este plan con tu Directora.</p>
        <fry-button hierarchy="primary" full-width icon-left="whatsapp-outline" text="Habla con tu Directora" onfryClick={hablarConDirectora} />
        <fry-button hierarchy="secondary" full-width text="Cambiar mi plan" onfryClick={() => setPaso('ritmo')} />
      </div>
      <NotaLegal tipo="simulador" />

      {nivelAbierto !== null && (
        <HojaNivel
          indice={nivelAbierto}
          onCambiar={setNivelAbierto}
          onCerrar={() => setNivelAbierto(null)}
          onHablar={hablarConDirectora}
        />
      )}
    </div>
  )
}
