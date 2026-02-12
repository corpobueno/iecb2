import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { ILeadsFiltros } from "../../../api/services/LeadsService";


interface ToggleButtonStatusProps {
    searchParams: ILeadsFiltros;
    setSearchParams: React.Dispatch<React.SetStateAction<ILeadsFiltros>> | ((params: ILeadsFiltros) => void);
    statusLeads: any[];
}
export const ToggleButtonStatus = ({
    statusLeads,
    searchParams,
    setSearchParams
}: ToggleButtonStatusProps) => {

    return(
        <Box
            sx={{
                width: '100%',
                overflowX: 'auto',
                overflowY: 'hidden',
                '&::-webkit-scrollbar': {
                    height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                    bgcolor: 'background.paper',
                    borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'divider',
                    borderRadius: '3px',
                    '&:hover': {
                        bgcolor: 'action.hover',
                    }
                }
            }}
        >
            <ToggleButtonGroup
                value={searchParams.selecao}
                exclusive
                onChange={(_, newStatus) => setSearchParams({ ...searchParams, selecao: newStatus })}
                size="small"
                sx={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    gap: 1,
                    pb: 0.5,
                    '& .MuiToggleButton-root': {
                        fontSize: '12px',
                        borderRadius: '16px !important',
                        border: '1px solid',
                        borderColor: 'divider',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        px: 2,
                        '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            }
                        }
                    }
                }}
            >
                <ToggleButton size="small" value="" aria-label="todos">
                    TODOS
                </ToggleButton>
                {statusLeads.map((status) => (
                    <ToggleButton key={status.id} value={status.id} aria-label={status.label}>
                        {status.label}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    )
}