import { useContext } from 'react'
import { WizardContext } from '../state/WizardContext'

export const useWizard = () => {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}
