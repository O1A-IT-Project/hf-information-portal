
// Utility function to detect the MIME type of an image based on its buffer
const detectImageMimeType = buffer => {
  if (!buffer || buffer.length < 4) return null

  const hex = buffer.subarray(0, 4).toString('hex')

  if (hex.startsWith('89504e47')) return 'image/png'
  if (hex.startsWith('ffd8ff')) return 'image/jpeg'
  if (hex.startsWith('47494638')) return 'image/gif'
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF') return 'image/webp'

  return null
}

export { detectImageMimeType }