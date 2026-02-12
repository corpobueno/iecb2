export const leads_indicacao = [
  { id: 'pendente', label: 'Pendente', color: '#DD35E6', icon: 'hourglass_empty' },
  { id: 'iniciado', label: 'Contato iniciado', color: '#0066ff', icon: 'check' },
  { id: 'sem-interesse', label: 'Sem Interesse', color: '#999999', icon: 'check' },
  { id: 'vendido', label: 'Vendido', color: '#229430', icon: 'check' },
]

export const leads_renegociacao = [
  { id: 'pendente', label: 'Pendente', color: '#DD35E6', icon: 'hourglass_empty' },
  { id: 'Falando no Chat', label: 'Falando no Chat', color: '#0066ff', icon: 'check' },
  { id: 'Retornar Ligação', label: 'Retornar Ligação', color: '#eb9413ff', icon: 'check' },
  { id: 'Interessado', label: 'Interessado', color: '#229430', icon: 'check' },
  { id: 'Outro Momento', label: 'Outro Momento', color: '#c5b914ff', icon: 'check' },
  { id: 'Sem Interesse', label: 'Sem Interesse', color: '#999999', icon: 'check' },
  { id: 'Sem Retorno', label: 'Sem Retorno', color: '#999999', icon: 'check' },
  { id: 'Pagamento Agendado', label: 'Pagamento Agendado', color: '#19cea7ff', icon: 'check' },
  { id: 'Lixeira', label: 'Lixeira', color: '#999999', icon: 'check' },
  { id: 'Sessão Experiência', label: 'Sessão Experiência', color: '#999999', icon: 'check' },
]

export const ociosos = [
  { id: 'pendente', label: 'Pendente', color: '#0066ff', icon: 'check' },
  { id: 'Falando no Chat', label: 'Falando no Chat', color: '#999999', icon: 'check' },
  { id: 'Agendado', label: 'Agendado', color: '#999999', icon: 'check' },
  { id: 'Resolvido', label: 'Resolvido', color: '#229430', icon: 'check' },
]

export const ociosos_situacao = [
  { id: '1 mes', label: '1 Mês', color: '#DD35E6', icon: 'hourglass_eMpty' },
  { id: '2 meses', label: '2 Meses', color: '#0066ff', icon: 'check' },
  { id: '2 meses e 20 dias', label: '2 Meses e 20 Dias', color: '#999999', icon: 'check' },
  { id: 'vencidos', label: 'Vencidos', color: '#999999', icon: 'check' },
]

export const leads_principal = [
  { id: 'pendente', label: 'Pendente', color: '#DD35E6', icon: 'hourglass_empty' },
  { id: 'Não Atendido', label: 'Não Atendido', color: '#e74646ff', icon: 'check' },
  { id: 'Mensagem Enviada', label: 'Mensagem Enviada', color: '#0066ff', icon: 'check' },
  { id: 'Retornar Ligação', label: 'Retornar Ligação', color: '#eb9413ff', icon: 'check' },
  { id: 'Outro Momento', label: 'Outro Momento', color: '#FAB307', icon: 'check' },
  { id: 'Indesico', label: 'Indesico', color: '#FAB307', icon: 'check' },
  { id: 'Agendado', label: 'Agendado', color: '#229430', icon: 'check' },
  { id: 'Sem Interesse', label: 'Sem Interesse', color: '#999999', icon: 'check' },
  { id: 'Sem Contato', label: 'Sem Contato', color: '#999999', icon: 'check' },
  { id: 'Lixeira', label: 'Lixeira', color: '#5f2a06ff', icon: 'check' },
]

export const leads_remarketing = leads_renegociacao

export const clientes_vip = leads_renegociacao

export const leads_orcamento = leads_renegociacao

export const leads_nao_vieram = leads_principal

export const leads_aniversario = leads_renegociacao

// Status para leads IECB
export const leads_iecb = [
  { id: 'nao', label: 'Novos', color: '#DD35E6', icon: 'hourglass_empty' },
  { id: '7', label: 'Atendendo', color: '#0066ff', icon: 'check' },
  { id: 'Mens', label: 'Mensagem Enviada', color: '#cc00ff', icon: 'check' }, 
  { id: '1', label: 'Agendado', color: '#229430', icon: 'check' },
  { id: '2', label: 'Sem Interesse', color: '#999999', icon: 'check' },
  { id: '3', label: 'Outro Momento', color: '#FAB307', icon: 'check' },
  { id: '4', label: 'Indeciso', color: '#FAB307', icon: 'check' },
  { id: '5', label: 'Sem Resposta', color: '#fa7407', icon: 'check' },
  { id: '6', label: 'Não Revisados', color: '#fa6007', icon: 'check' },
  { id: '7', label: 'Revisados', color: '#0db980', icon: 'check' },
  { id: 'lixeira', label: 'Lixeira', color: '#999999', icon: 'check' },
]

export const list = {
  leads_principal,
  leads_indicacao,
  leads_renegociacao,
  leads_remarketing,
  leads_orcamento,
  clientes_vip,
  ociosos,
  leads_nao_vieram,
  leads_aniversario,
  leads_iecb,

}

export const getStatus = (leads: string, id: string) => {

  return (list[leads as keyof typeof list].find(element => element.id === String(id))) ?? null
}

export const getStatusList = (leads: string) => {
  return list[leads as keyof typeof list]
}
