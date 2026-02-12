import { ReactNode } from 'react';
import { CircularProgress } from '@mui/material';
import { Box } from '@mui/system';


interface ILayoutBaseDePaginaProps {
  title?: string;
  children: ReactNode;
  toolbar?: ReactNode;
  isLoading?: boolean;
}

export const PageContainer: React.FC<ILayoutBaseDePaginaProps> = ({ children, toolbar, isLoading = false }) => {

  return (
    <Box
      
      sx={{
        width: "100%",
        height:'100%',
        py: 1,
        overflow: "hidden",

      }}
    >

      {toolbar && (
        <Box>
          {toolbar}
        </Box>
      )}

      <Box
        
        sx={{
          height: "calc(100vh - 55px)", // Ajuste a altura com base na altura total disponível
          overflow: "auto"
        }}

      >
        {!isLoading ? children :
          (
            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={'100%'}>
              <CircularProgress />
            </Box>
          )

        }
      </Box>
    </Box>
  );
};
