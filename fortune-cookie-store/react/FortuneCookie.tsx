import React, { useState } from "react"
import { Button, Spinner } from "vtex.styleguide"
import { useCssHandles } from "vtex.css-handles"

const CSS_HANDLES = [
  "cookieContainer",
  "cookieButton",
  "cookiePhrase",
  "luckyNumber",
] as const

const FortuneCookie: React.FC = () => {
  const handles = useCssHandles(CSS_HANDLES)
  const [loading, setLoading] = useState(false)
  const [phrase, setPhrase] = useState<string | null>(null)
  const [luck, setLuck] = useState<string | null>(null)

  const getLuckyNumber = () => {
    const rnd = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min
    return `${rnd(10, 99)}-${rnd(10, 99)}-${rnd(1000, 9999)}`
  }

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dataentities/CF/search?_fields=CookieFortune&_size=10')
      const data = await res.json()
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length)
        setPhrase(data[randomIndex].CookieFortune || "Sin frase disponible")
      } else {
        setPhrase("No hay frases disponibles.")
      }
      setLuck(getLuckyNumber())
    } catch (err) {
      console.error(err)
      setPhrase("Ups, falló la galleta.")
      setLuck(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${handles.cookieContainer} ph5 pv6 flex flex-column items-center`}>
      <Button
        variation="primary"
        size="small"
        isLoading={loading}
        onClick={handleClick}
      >
        {loading
          ? <Spinner size={20} color="#fff" />
          : phrase
            ? "Abrir otra galleta"
            : "Abrir galleta"}
      </Button>

      {phrase && (
        <h3 className={handles.cookiePhrase}>
          " {phrase}"
        </h3>
      )}

      {luck && (
        <h5 className={handles.luckyNumber}>
          {luck}
        </h5>
      )}
    </div>
  )
}

export default FortuneCookie
