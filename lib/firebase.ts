/**
 * @fileoverview Configuración e inicialización única del cliente de Firebase y Firestore.
 * Centraliza el acceso a la base de datos en la nube para las rutas de API y componentes del panel.
 */

import { initializeApp, getApps } from "firebase/app"
import { getAnalytics, isSupported } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"

/**
 * Objeto de configuración de credenciales de Firebase obtenidas desde variables de entorno.
 */
const configuracion_firebase = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

/**
 * Instancia única de la aplicación de Firebase para evitar reinicializaciones en caliente.
 */
const aplicacion_firebase =
  getApps().length === 0 ? initializeApp(configuracion_firebase) : getApps()[0]

/**
 * Instancia principal de Cloud Firestore para lectura y escritura de estadísticas del panel.
 */
const base_datos_firestore = getFirestore(aplicacion_firebase)

/**
 * Instancia de Firebase Analytics inicializada únicamente en entorno de navegador.
 */
let instancia_analitica: ReturnType<typeof getAnalytics> | null = null
if (typeof window !== "undefined") {
  isSupported().then((soporta_analitica) => {
    if (soporta_analitica) {
      instancia_analitica = getAnalytics(aplicacion_firebase)
    }
  })
}

export {
  aplicacion_firebase,
  base_datos_firestore,
  instancia_analitica,
  base_datos_firestore as firestoreDatabase,
  base_datos_firestore as db,
}
