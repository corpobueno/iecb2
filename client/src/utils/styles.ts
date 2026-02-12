

export const scrollStyle = {
    '&::-webkit-scrollbar': {
        width: '6px', // Define a barra de rolagem fina
        height: '8px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#bbb',
        borderRadius: '10px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: '#eee', // Muda a cor ao passar o mouse
      },
      '&:hover': {
        '&::-webkit-scrollbar': {
          width: '6px', // Expande a barra ao passar o mouse
        },
      },
}