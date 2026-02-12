import React, { useState } from 'react';
import { Tabs, Tab, Box, useTheme, } from '@mui/material';

interface TabsNavigatorProps {
    steps: { label: string, content: React.ReactNode }[];
    mostrarBotaoMenu?: boolean;
    defaultActiveStep?: number;
}

export const TabsNavigator: React.FC<TabsNavigatorProps> = ({ defaultActiveStep = 0, steps }) => {
    const [activeStep, setActiveStep] = useState(defaultActiveStep);

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveStep(newValue);
    };
    // const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
    const theme = useTheme();
    return (
        <Box height={'100%'} display="flex" flexDirection="column" gap={0.1}>
            {/* Botões no topo da página */}
            <Box display='flex' marginX={theme.spacing(1)} >

               
                <Tabs value={activeStep} onChange={handleChange} variant="fullWidth" >
                    {steps.map((step, index) => (
                        <Tab sx={{
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipses"
                        }}
                            key={index}
                            label={step.label}
                        />
                    ))}
                </Tabs>
            </Box>
            {/* Conteúdo dos "steps" */}
            <Box>
                {steps[activeStep].content}
            </Box>
        </Box>
    );
};
