'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface PushContextType {
  isSupported: boolean
  isSubscribed: boolean
  subscribe: () => Promise<PushSubscription | null>
  subscription: PushSubscription | null
}

const PushContext = createContext<PushContextType>({
  isSupported: false,
  isSubscribed: false,
  subscribe: async () => null,
  subscription: null,
})

export function PushProvider({ children }: { children: ReactNode }) {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      const sub = await registration.pushManager.getSubscription()
      if (sub) {
        setIsSubscribed(true)
        setSubscription(sub)
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  const subscribe = async () => {
    if (!isSupported) return null

    try {
      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not found')
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      setIsSubscribed(true)
      setSubscription(sub)
      return sub
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  return (
    <PushContext.Provider value={{ isSupported, isSubscribed, subscribe, subscription }}>
      {children}
    </PushContext.Provider>
  )
}

export const usePush = () => useContext(PushContext)

// Utility to convert Base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
