export default function padNumber (num, size) {
  const s = num + ''
  return s.padStart(size, '0')
}
