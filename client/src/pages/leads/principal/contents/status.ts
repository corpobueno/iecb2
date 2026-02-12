export const statusLeads = [
  { id: 'pendente', label: 'Pendente', color: '#DD35E6', icon: 'hourglass_empty' },
  { id: 'iniciado', label: 'Contato iniciado', color: '#0066ff', icon: 'check' },
  { id: 'sem-interesse', label: 'Sem Interesse', color: '#999999', icon: 'check' },
  { id: 'vendido', label: 'Vendido', color: '#229430', icon: 'check' },
]

export const optionsStatus = statusLeads.filter(status => status.id !== null)
export const getStatusColor = (status: string) => {

  const statusColor = statusLeads.find(statusItem => statusItem.id === status)

  return statusColor ? statusColor.color : 'red'
}

export const getStatusIcon = (status: string) => {

  const statusIcon = statusLeads.find(statusItem => statusItem.id === status)

  return statusIcon ? statusIcon.icon : 'close'
}

export const getStatusLeads = (status: string) => {

  const selectedStatus = statusLeads.find(statusItem => statusItem.id === status)

  return selectedStatus ?? statusLeads[0]
}

