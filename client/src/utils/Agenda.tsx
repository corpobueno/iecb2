import { Box, Icon, IconButton } from "@mui/material"
import { useAppThemeContext } from "../contexts";
import { useNavigate } from "react-router-dom";
import React from "react";

export const FooterDrawerAgenda: React.FC<{ open: string }> = ({ open }) => {
    const { toggleTheme, theme } = useAppThemeContext();
    const navigate = useNavigate();
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', position: 'absolute', bottom: 0, width: '100%' }} height={theme.spacing(7)}>

            <IconButton size='small' onClick={toggleTheme}>
                <Icon>dark_mode</Icon>
            </IconButton>
            <IconButton sx={{ p: 1 }} onClick={() => window.open(open)}>
                <Icon>queue_play</Icon>
            </IconButton>
            <IconButton sx={{ p: 1 }} onClick={() => navigate('/')}>
                <Icon>reply</Icon>
            </IconButton>

        </Box>


    )
}

interface NavBarDrawerAgendaProps {
    children?: React.ReactNode;
}

export const NavBarDrawerAgenda = ({ children }: NavBarDrawerAgendaProps) => {
    return (
        <Box sx={
            {
                overflow: 'auto',
                mb: 10,
                height: 'calc(100vh - 330px)',
                '&::-webkit-scrollbar': {
                    width: '6px', // Define a barra de rolagem fina
                    height: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#ccc',
                    borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#ccc', // Muda a cor ao passar o mouse
                },
                overflowY: 'auto',
                overflowX: 'hidden',
                flex: 1,
            }}>
            {children}
        </Box>
    );
};

