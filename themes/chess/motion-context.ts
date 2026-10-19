import { createContext, useContext } from 'react'
export const MotionContext = createContext({
  paused: false,
  reduced: false,
  toggle: () => {},
})
export const useClubMotion = () => useContext(MotionContext)
