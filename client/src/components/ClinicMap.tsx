import { useState } from 'react'
import styles from './ClinicMap.module.css'

type Coords = {
  lat: number
  lng: number
}

function ClinicMap() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const [coords, setCoords] = useState<Coords | null>(null)
  const [locationError, setLocationError] = useState('')
  const [locating, setLocating] = useState(false)

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationError('Your browser does not support location access.')
      return
    }

    setLocating(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      position => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocating(false)
      },
      () => {
        setLocationError('We could not get your location. Please check your location permission and try again.')
        setLocating(false)
      }
    )
  }

  const params = new URLSearchParams({
    key: apiKey,
    q: coords ? `clinics near ${coords.lat},${coords.lng}` : 'clinics near me',
  })

  if (coords) {
    params.set('center', `${coords.lat},${coords.lng}`)
    params.set('zoom', '12')
  }

  return (
    <section className={styles.mapSection}>
      <button
        type="button"
        className={styles.locationButton}
        onClick={requestLocation}
        disabled={locating}
      >
        {locating ? 'Finding your location...' : 'Use my location'}
      </button>

      {locationError && <p role="alert">{locationError}</p>}

      <div className={styles.mapWrapper}>
        <iframe
          className={styles.mapFrame}
          title="Clinics near you"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/search?${params}`}
        />
      </div>
    </section>
  )
}

export default ClinicMap