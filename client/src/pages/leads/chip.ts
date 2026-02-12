
export const comercial = [
    { id: 3, empresa: 1 },
    { id: 80, empresa: 2 },
    { id: 63, empresa: 5 },
    { id: 71, empresa: 6 },
    { id: 84, empresa: 7 },
    { id: 86, empresa: 8 },
  ]

export const atendentes = [
    { id: 76, empresa: 1 },
    { id: 80, empresa: 2 },
    { id: 63, empresa: 5 },
    { id: 71, empresa: 6 },
    { id: 84, empresa: 7 },
    { id: 86, empresa: 8 },
  ]

export const avaliadoras = [
   // { id: 76, empresa: 1 },
    { id: 53, empresa: 2 },
    { id: 64, empresa: 5 },
    { id: 72, empresa: 6 },
    { id: 85, empresa: 7 },
    { id: 88, empresa: 8 },
  ]

  export const recepcao = [
    { id: 92, empresa: 1 },
    { id: 52, empresa: 2 },
    { id: 61, empresa: 5 },
    { id: 70, empresa: 6 },
    { id: 83, empresa: 7 },
    { id: 87, empresa: 8 },
  ]


export const list = {
    leads_indicacao: atendentes,
    leads_renegociacao: avaliadoras,
    leads_remarketing: comercial,
    clientes_vip: comercial,
    ociosos: recepcao,
    leads_principal: comercial,

}
  
export const getChip = (leads: string, empresa: string) => {

    return (list[leads as keyof typeof list].find(element => element.empresa === Number(empresa))?.id) ?? null
}