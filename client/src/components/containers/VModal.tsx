import { Box, Modal, useTheme } from "@mui/material";

export const VModal: React.FC<{ children: React.ReactNode, modal: any, sx?: Object }> = (
  { modal: { modalIsOpen, setModalIsOpen },
sx = { width: '90%', height: '90%' },
   children }) => {
    const theme = useTheme();
      
    const handleClose = () => setModalIsOpen(false);
    return (
      <Modal
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        open={modalIsOpen}
        onClose={handleClose}
      >
        <Box
        key={theme.palette.mode}
          sx={{
            ...sx,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.default',
            boxShadow: 10,
            maxHeight: '95vh',
            p: 4,
            zIndex: 100,
          }}
        >
        
            {children}
     
        </Box>
      </Modal>
    );
  };