import { useEffect, useState } from 'react'
import { Aviso } from './components/Aviso'
import { Cabecera } from './components/Cabecera'
import { CapaContexto } from './components/Capa'
import { NavInferior } from './components/NavInferior'
import { VerComo } from './components/VerComo'
import { ChatDirectora } from './screens/ChatDirectora'
import { ConfigScreen } from './screens/ConfigScreen'
import { FlujoCarrera } from './screens/flujo/FlujoCarrera'
import { Home } from './screens/Home'
import { MiCarrera } from './screens/MiCarrera'
import { MiNegocio } from './screens/MiNegocio'
import { Placeholder } from './screens/Placeholder'
import { navegar, rutaExiste, RUTAS, useRuta } from './state/router'
import { useDemo } from './state/store'

export default function App() {
  const ruta = useRuta()
  const { sesion, perfil } = useDemo()
  const [capa, setCapa] = useState<HTMLElement | null>(null)

  const enConfig = !sesion || ruta === RUTAS.config
  const rutaValida = rutaExiste(ruta, perfil.grupo)

  // Si la pantalla actual no existe para el perfil, va a su inicio.
  useEffect(() => {
    if (!enConfig && !rutaValida) navegar(RUTAS.inicio, { reemplazar: true })
  }, [enConfig, rutaValida])

  if (enConfig) {
    return (
      <div className="app">
        <ConfigScreen />
      </div>
    )
  }

  const enChat = ruta === RUTAS.chatDirectora
  const conNav = perfil.grupo !== 'lider' && !enChat

  return (
    <div className="app">
      <CapaContexto.Provider value={capa}>
        {enChat ? (
          <ChatDirectora />
        ) : (
          <>
            <Cabecera />
            <main className="pantalla" key={ruta}>
              <Pantalla ruta={ruta} />
            </main>
            {conNav && <NavInferior ruta={ruta} />}
          </>
        )}
        <FlujoCarrera />
        {!enChat && <VerComo ruta={ruta} conNav={conNav} />}
        <Aviso />
        <div className="capa" ref={setCapa} />
      </CapaContexto.Provider>
    </div>
  )
}

function Pantalla({ ruta }: { ruta: string }) {
  const { perfil } = useDemo()
  if (perfil.grupo === 'lider') {
    return <Placeholder titulo="Home de la Líder" detalle="Se construye en la etapa 3 (Parte C · Emprendedoras)." />
  }
  switch (ruta) {
    case RUTAS.miNegocio:
      return <MiNegocio />
    case RUTAS.misGrupos:
      return <Placeholder titulo="Mis Grupos" />
    case RUTAS.programas:
      return <Placeholder titulo="Programas" />
    case RUTAS.miCarrera:
      return <MiCarrera />
    case RUTAS.formaciones:
      return <Placeholder titulo="Formaciones" detalle="Se construye en la etapa 2 (Parte B · Directoras)." />
    default:
      return <Home />
  }
}
