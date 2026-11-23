/** "S/21,200": sin espacio y con coma de miles. */
export function soles(monto: number): string {
  return 'S/' + Math.round(monto).toLocaleString('en-US')
}

/** Miles con coma, sin símbolo: "21,200". */
export function miles(monto: number): string {
  return Math.round(monto).toLocaleString('en-US')
}

/** "luciana  " → "Luciana": sin espacios sobrantes y con la primera letra en mayúscula. */
export function normalizarNombre(texto: string): string {
  const limpio = texto.trim().replace(/\s+/g, ' ')
  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}

export function minusculaInicial(texto: string): string {
  return texto.charAt(0).toLowerCase() + texto.slice(1)
}

/** Hora al estilo de WhatsApp en español: "9:41 a. m." */
export function horaChat(fecha: Date): string {
  const h = fecha.getHours()
  const m = String(fecha.getMinutes()).padStart(2, '0')
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'a. m.' : 'p. m.'}`
}
