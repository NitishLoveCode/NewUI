'use client'

import { useEffect } from 'react'

export default function LoginPage() {
  useEffect(() => {
    console.log('=== PAGE LOADED ===')
  }, [])

  return (
    <div style={{ padding: '40px', textAlign: 'center', background: '#f0f0f0' }}>
      <h1 style={{ color: 'red', fontSize: '32px' }}>🚀 LOGIN PAGE LOADED</h1>

      <button
        onClick={() => {
          console.log('TEST BUTTON CLICKED')
          alert('TEST BUTTON WORKS!')
        }}
        style={{
          padding: '20px 40px',
          fontSize: '18px',
          cursor: 'pointer',
          background: 'blue',
          color: 'white',
          border: 'none',
          marginTop: '20px'
        }}
      >
        CLICK ME - TEST BUTTON
      </button>
    </div>
  )
}
