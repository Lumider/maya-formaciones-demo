/**
 * ÚNICA FUENTE DE DATOS DE LA DEMO.
 * Perfiles, ganancias, requisitos, textos legales y URLs viven aquí.
 * Ningún número se escribe directo en los componentes.
 */

export type Sigla = 'CNS' | 'CEM' | 'CES' | 'JNR' | 'SNR' | 'SSE' | 'REG'
export type Grupo = 'emprendedora' | 'directora' | 'lider'
export type NivelId = 'consultora' | 'cem' | 'cemSenior' | 'aspirante' | 'directora'

export interface Nivel {
  id: NivelId
  nombre: string
  descripcion: string
  /** Qué se necesita para llegar a este nivel. */
  requisitos: string[]
  /** Aclaración que acompaña a los requisitos (opcional). */
  notaRequisitos?: string
  /** Ganancia referencial por campaña; null = no se muestra. */
  gananciaReferencial: number | null
  /** true = la cifra se presenta como "desde S/…". */
  gananciaDesde?: boolean
}

/** Grupo del desglose de Mi negocio, con sus líneas. */
export interface GrupoDesglose {
  titulo: string
  lineas: { concepto: string; monto: number }[]
}

export type Intencion = 'quiere' | 'aunNoDecide' | 'noRegistro'

/** Variables que definen si una candidata o emprendedora "cumple". */
export interface Metricas {
  ventaGP: number
  activas: number
  pped: number
}

/** Candidata del grupo de una Directora Junior o Senior (Parte B). */
export interface Candidata extends Metricas {
  id: string
  nombre: string
  nivel: NivelId
  intencion: Intencion
  /** Sueño registrado (clave de CONFIG.suenos.segundaPersona); solo si quiere ser Directora. */
  sueno?: string
  /** Si se indica, la candidata solo aparece para esos perfiles. */
  soloPara?: Sigla[]
}

export interface Ascenso {
  titulo: string
  desde: string
  hacia: string
  beneficios: string[]
}

export interface Perfil {
  sigla: Sigla
  grupo: Grupo
  /** Línea descriptiva del panel "Ver como". */
  descripcion: string
  /** Ganancia estimada actual; null = no se muestra (Líderes). */
  gananciaActual: number | null
  /** Posición en el camino de carrera (solo Emprendedoras). */
  nivel?: NivelId
  /** Resumen "Mi Campaña" del Home. */
  campana: {
    ventaGP: number
    activasGrupo: number
    deudaActual: number
    creditoYanbal: number
    ventaPersonal: number
  }
  /** Desglose de Mi negocio; debe sumar gananciaActual. */
  desglose: GrupoDesglose[]
}

export const CONFIG = {
  campana: {
    actual: 11,
    etiqueta: 'Campaña 11',
    corte: 'C11 - S3',
    actualizado: 'Actualizado 09:30 a.m.',
  },

  /** Cifra de carrera: siempre "desde S/1,820 por campaña". */
  gananciaDirectora: 1820,

  /** Directora madre por defecto de las Emprendedoras. */
  directoraPorDefecto: 'Gabriela',

  video: {
    youtubeId: 'YL7sFP6tr2M',
    url: 'https://www.youtube.com/watch?v=YL7sFP6tr2M',
  },

  urls: {
    /** TODO: URL real del simulador de carrera. */
    simuladorUrl: 'https://example.com/simulador-carrera',
    /** TODO: URL real del simulador de formación. */
    simuladorDirUrl: 'https://example.com/simulador-formacion',
    /** Texto corto con el que se muestra el enlace a Mi carrera en los mensajes. TODO: enlace real. */
    linkMiCarrera: 'maya.yanbal.com/mi-carrera',
  },

  /** Bono de formación: siempre "S/750". Nunca va en mensajes a candidatas o emprendedoras. */
  bonoFormacion: 750,

  /** Umbrales de "cumple": los mismos para la vista de Directora y la de Líderes. */
  umbrales: { ventaGP: 15000, activas: 10, pped: 3 } satisfies Metricas as Metricas,

  legales: {
    ganancia: '*Ganancia estimada referencial por campaña (4 semanas).',
    bono: '*Bono referencial, sujeto a las condiciones del programa de formación.',
  },

  suenos: {
    opciones: ['Comprar mi casa', 'Universidad de mis hijos', 'Viajar en familia', 'Tener mi negocio'],
    otro: 'Otro',
    maxCaracteresOtro: 40,
    /** TODO: definir si el monto es obligatorio. */
    montoObligatorio: false,
    /** El mismo sueño dicho en segunda persona, para los mensajes de la Directora. */
    segundaPersona: {
      'Comprar mi casa': 'comprar tu casa',
      'Universidad de mis hijos': 'pagar la universidad de tus hijos',
      'Viajar en familia': 'viajar en familia',
      'Tener mi negocio': 'tener tu negocio',
      'Pagar estudios': 'pagar tus estudios',
    } as Record<string, string>,
  },

  /** Camino de carrera, de menor a mayor. */
  niveles: [
    {
      id: 'consultora',
      nombre: 'Consultora',
      descripcion: 'El punto de partida: vendes productos Yanbal y ganas por tu venta personal.',
      requisitos: [],
      gananciaReferencial: null,
    },
    {
      id: 'cem',
      nombre: 'CEM',
      descripcion: 'Además de vender, incorporas nuevas consultoras y ganas por cada una.',
      requisitos: ['Venta personal en Nivel 1 de Ganamás (S/470)', '1 nueva consultora activa en Nivel 1'],
      gananciaReferencial: 600,
    },
    {
      id: 'cemSenior',
      nombre: 'CEM Senior',
      descripcion: 'Lideras tu propio grupo y ganas un porcentaje de sus ventas.',
      notaRequisitos: 'En una misma campaña:',
      requisitos: [
        'Venta personal en Nivel 1 de Ganamás (S/470)',
        '2 primeros pedidos directos',
        '5 activas directas',
        'Venta de Grupo Personal de S/6,000',
      ],
      gananciaReferencial: 970,
    },
    {
      id: 'aspirante',
      nombre: 'Aspirante',
      descripcion: 'Entras al programa Fórmate como Directora, con acompañamiento de tu Directora.',
      requisitos: [
        'Venta de Grupo Personal al 60% de la meta',
        'Mantener calificación de CEM Senior',
        'Morosidad dentro del límite',
        'Entrevista de postulación',
      ],
      gananciaReferencial: 1400,
    },
    {
      id: 'directora',
      nombre: 'Directora',
      descripcion: 'Diriges tu Grupo Personal y accedes a bonos, reconocimientos y viajes.',
      requisitos: [
        'Venta personal en Nivel 1 de Ganamás (S/470)',
        '3 primeros pedidos en el grupo',
        '20 activas en el grupo',
        'Meta de venta del grupo completa',
        'Morosidad dentro del límite',
        '8 cursos completados',
      ],
      gananciaReferencial: 1820,
      gananciaDesde: true,
    },
  ] satisfies Nivel[] as Nivel[],

  perfiles: {
    CNS: {
      sigla: 'CNS',
      grupo: 'emprendedora',
      descripcion: 'Consultora — vende, aún no ha incorporado a nadie',
      gananciaActual: 180,
      nivel: 'consultora',
      campana: { ventaGP: 0, activasGrupo: 0, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 520 },
      desglose: [
        { titulo: 'Mi Venta Personal', lineas: [{ concepto: 'Escala del 25% dto.', monto: 130 }] },
        { titulo: 'Mis Premios', lineas: [{ concepto: 'Wafflera Oster', monto: 50 }] },
      ],
    },
    CEM: {
      sigla: 'CEM',
      grupo: 'emprendedora',
      descripcion: 'CEM — vende e incorpora nuevas consultoras',
      gananciaActual: 440,
      nivel: 'cem',
      campana: { ventaGP: 400, activasGrupo: 1, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 400 },
      desglose: [
        { titulo: 'Mi Venta Personal', lineas: [{ concepto: 'Escala del 25% dto.', monto: 100 }] },
        {
          titulo: 'Mis Premios',
          lineas: [
            { concepto: 'Microondas Oster', monto: 100 },
            { concepto: 'Wafflera Oster', monto: 40 },
          ],
        },
        {
          titulo: 'Mis Programas',
          lineas: [
            { concepto: 'Incorpora y Gana', monto: 150 },
            { concepto: 'Elige Crecer', monto: 50 },
          ],
        },
      ],
    },
    CES: {
      sigla: 'CES',
      grupo: 'emprendedora',
      descripcion: 'CEM Senior — lidera un grupo propio de consultoras',
      gananciaActual: 970,
      nivel: 'cemSenior',
      campana: { ventaGP: 6400, activasGrupo: 6, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 480 },
      desglose: [
        { titulo: 'Mi Venta Personal', lineas: [{ concepto: 'Escala del 25% dto.', monto: 120 }] },
        { titulo: 'Ganancia por mi grupo', lineas: [{ concepto: 'Comisión por venta de Grupo Personal', monto: 650 }] },
        {
          titulo: 'Mis Programas',
          lineas: [
            { concepto: 'Incorpora y Gana', monto: 150 },
            { concepto: 'Elige Crecer', monto: 50 },
          ],
        },
      ],
    },
    JNR: {
      sigla: 'JNR',
      grupo: 'directora',
      descripcion: 'Directora Junior — gestiona su Grupo Personal, aún sin hijas directoras',
      gananciaActual: 2390,
      campana: { ventaGP: 18900, activasGrupo: 24, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 800 },
      desglose: [
        { titulo: 'Mi Venta Personal', lineas: [{ concepto: 'Honorarios 8%', monto: 2200 }] },
        { titulo: 'Venta Personal', lineas: [{ concepto: 'Escala 25% dto.', monto: 50 }] },
        {
          titulo: 'Mis Premios',
          lineas: [
            { concepto: 'Microondas Oster', monto: 100 },
            { concepto: 'Wafflera Oster', monto: 40 },
          ],
        },
      ],
    },
    SNR: {
      sigla: 'SNR',
      grupo: 'directora',
      descripcion: 'Directora Senior — ya formó a una Directora',
      gananciaActual: 3400,
      campana: { ventaGP: 24500, activasGrupo: 31, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 800 },
      desglose: [
        { titulo: 'Mi Venta Personal', lineas: [{ concepto: 'Honorarios 8%', monto: 2700 }] },
        { titulo: 'Ganancia por hijas Directoras', lineas: [{ concepto: 'Comisión 5% por 1 hija Directora', monto: 500 }] },
        { titulo: 'Venta Personal', lineas: [{ concepto: 'Escala 25% dto.', monto: 60 }] },
        {
          titulo: 'Mis Premios',
          lineas: [
            { concepto: 'Microondas Oster', monto: 100 },
            { concepto: 'Wafflera Oster', monto: 40 },
          ],
        },
      ],
    },
    SSE: {
      sigla: 'SSE',
      grupo: 'lider',
      descripcion: 'Directora Super Senior — lidera a sus Directoras hijas',
      gananciaActual: null,
      campana: { ventaGP: 80000, activasGrupo: 96, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 800 },
      desglose: [],
    },
    REG: {
      sigla: 'REG',
      grupo: 'lider',
      descripcion: 'Directora Regional — lidera una región de Directoras',
      gananciaActual: null,
      // En esta versión SSE y REG ven la misma vista con los mismos datos.
      campana: { ventaGP: 80000, activasGrupo: 96, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 800 },
      desglose: [],
    },
  } satisfies Record<Sigla, Perfil> as Record<Sigla, Perfil>,

  /** Bloque de ascenso del popup del bono, por perfil. TODO: validar porcentajes y reglas. */
  ascensos: {
    JNR: {
      titulo: 'Forma 1 Directora y asciende a Directora Senior.',
      desde: 'Directora Junior',
      hacia: 'Directora Senior',
      beneficios: [
        'Ganas 5% por tus hijas Directoras (hoy 4.5%)',
        'Empiezas a ganar por tus nietas Directoras (0.3%)',
        'Quedas a 2 formaciones de Super Senior',
      ],
    },
    SNR: {
      titulo: 'Forma 2 Directoras más y asciende a Super Senior.',
      desde: 'Directora Senior',
      hacia: 'Directora Super Senior',
      beneficios: [
        'Ganas 5.5% por tus hijas Directoras (hoy 5%)',
        'Ganas 0.5% por tus nietas Directoras (hoy 0.3%)',
        'Accedes al programa de auto',
      ],
    },
  } as Partial<Record<Sigla, Ascenso>>,

  /** Textos de la Parte B que dependen de la primera variable que la candidata no cumple. */
  faltantes: {
    pped: {
      aviso: 'Le faltan primeros pedidos: motívala a incorporar esta campaña.',
      mensaje: 'sumar primeros pedidos',
    },
    activas: {
      aviso: 'Le faltan activas: ayúdala a reactivar a su grupo.',
      mensaje: 'sumar activas en tu grupo',
    },
    ventaGP: {
      aviso: 'Le falta venta de grupo: revisen juntas su plan de campaña.',
      mensaje: 'subir la venta de tu grupo',
    },
  } satisfies Record<keyof Metricas, { aviso: string; mensaje: string }>,

  /** Candidatas del Grupo Personal de las Directoras Junior y Senior. */
  candidatas: [
    { id: 'luciana-grande', nombre: 'Luciana Grande', nivel: 'cemSenior', ventaGP: 21200, activas: 10, pped: 7, intencion: 'quiere', sueno: 'Comprar mi casa' },
    { id: 'maria-ramos', nombre: 'María Ramos', nivel: 'cemSenior', ventaGP: 15200, activas: 10, pped: 2, intencion: 'quiere', sueno: 'Pagar estudios' },
    { id: 'diego-vasquez', nombre: 'Diego Vásquez', nivel: 'cem', ventaGP: 15200, activas: 10, pped: 2, intencion: 'quiere', sueno: 'Tener mi negocio' },
    { id: 'carolina-rios', nombre: 'Carolina Ríos', nivel: 'consultora', ventaGP: 5200, activas: 0, pped: 3, intencion: 'quiere', sueno: 'Viajar en familia' },
    { id: 'elena-paz', nombre: 'Elena Paz', nivel: 'cemSenior', ventaGP: 18500, activas: 22, pped: 3, intencion: 'noRegistro' },
    { id: 'rosa-medina', nombre: 'Rosa Medina', nivel: 'cemSenior', ventaGP: 17500, activas: 20, pped: 3, intencion: 'noRegistro' },
    { id: 'patricia-solis', nombre: 'Patricia Solís', nivel: 'cemSenior', ventaGP: 19800, activas: 12, pped: 5, intencion: 'quiere', sueno: 'Pagar estudios', soloPara: ['SNR'] },
    { id: 'carmen-vela', nombre: 'Carmen Vela', nivel: 'cemSenior', ventaGP: 18900, activas: 11, pped: 4, intencion: 'quiere', sueno: 'Tener mi negocio', soloPara: ['SNR'] },
  ] as Candidata[],

  /** Agrupación de los botones del panel "Ver como". */
  verComo: [
    { titulo: 'EMPRENDEDORAS', siglas: ['CNS', 'CEM', 'CES'] },
    { titulo: 'DIRECTORAS', siglas: ['JNR', 'SNR', 'SSE', 'REG'] },
  ] as { titulo: string; siglas: Sigla[] }[],
}

export const SIGLAS = Object.keys(CONFIG.perfiles) as Sigla[]

export function esSigla(valor: string | null | undefined): valor is Sigla {
  return !!valor && (SIGLAS as string[]).includes(valor)
}

// Comprobación de consistencia: el desglose de Mi negocio debe sumar la ganancia del perfil.
if (import.meta.env.DEV) {
  for (const p of Object.values(CONFIG.perfiles)) {
    const suma = p.desglose.flatMap((g) => g.lineas).reduce((total, linea) => total + linea.monto, 0)
    if (p.gananciaActual !== null && suma !== p.gananciaActual) {
      console.error(`[config] El desglose de ${p.sigla} suma ${suma} y su ganancia es ${p.gananciaActual}`)
    }
  }
}
