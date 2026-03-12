export function useMode() {
  const isPro = import.meta.env.VITE_IS_PRO === 'true'
  return { isPro }
}
