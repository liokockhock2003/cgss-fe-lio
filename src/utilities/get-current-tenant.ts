export const getCurrentTenant = () => {
  const host = window.location.hostname // e.g., "demo.ghgcope.com"
  const parts = host.split('.')
  let currentTenant = 'demo'

  if (parts.length > 2) {
    currentTenant = ['mig', 'demo', 'mycronsteel', 'demofresh'].includes(parts[0]) ? parts[0] : 'demo'
  }

  // currentTenant = 'mig'

  return currentTenant
}
