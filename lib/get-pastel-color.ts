export const getPastelColor = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  const s = 40 + (Math.abs(hash) % 10)
  const l = 85 + (Math.abs(hash) % 5)
  return `hsl(${h}, ${s}%, ${l}%)`
}
