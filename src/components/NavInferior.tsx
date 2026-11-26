import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'
import inicio from '../assets/figma/nav/nav-house.svg'
import negocio from '../assets/figma/nav/nav-briefcase.svg'
import grupos from '../assets/figma/nav/nav-users.svg'
import programas from '../assets/figma/nav/nav-award.svg'
import carrera from '../assets/figma/nav/nav-carrera.svg'

interface Item {
  etiqueta: string
  ruta: string
  icono: string
}

/**
 * Barra inferior (frame "NavBar" del Figma): fondo degradado naranja, iconos y textos blancos,
 * y la pestaña activa con un velo claro y una línea azul abajo. La quinta pestaña depende del
 * perfil: "Mi carrera" o "Formaciones".
 */
export function NavInferior({ ruta }: { ruta: string }) {
  const { perfil } = useDemo()
  const quinta =
    perfil.grupo === 'directora'
      ? { etiqueta: 'Formaciones', ruta: RUTAS.formaciones }
      : { etiqueta: 'Mi carrera', ruta: RUTAS.miCarrera }
  const items: Item[] = [
    { etiqueta: 'Inicio', ruta: RUTAS.inicio, icono: inicio },
    { etiqueta: 'Mi Negocio', ruta: RUTAS.miNegocio, icono: negocio },
    { etiqueta: 'Mis Grupos', ruta: RUTAS.misGrupos, icono: grupos },
    { etiqueta: 'Programas', ruta: RUTAS.programas, icono: programas },
    { ...quinta, icono: carrera },
  ]
  return (
    <nav className="nav" aria-label="Navegación principal">
      {items.map((item) => {
        const activa = item.ruta === ruta
        return (
          <button
            key={item.ruta}
            className={`nav__item ${activa ? 'nav__item--activa' : ''}`}
            aria-current={activa ? 'page' : undefined}
            onClick={() => navegar(item.ruta)}
          >
            <span className="nav__icono">
              <img src={item.icono} alt="" />
            </span>
            {item.etiqueta}
          </button>
        )
      })}
    </nav>
  )
}
