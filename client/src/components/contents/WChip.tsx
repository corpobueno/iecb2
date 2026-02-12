import { Chip } from "@mui/material"
import { getMethodTransaction } from "../../utils/template"

const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
        'pendente': '#FF9800',
        'andamento': '#2196F3',     // Azul
        'finalizado': '#4CAF50',    // Verde
        'cancelado': '#F44336',     // Vermelho
        'autorizado': '#9C27B0',    // Roxo
        'separacao': '#FF5722',     // Laranja escuro
        'pronto': '#00BCD4',        // Ciano
        'entrada': '#607D8B',       // Cinza azulado
    };

    return statusColors[status.toLowerCase()] || '#9E9E9E'; // Cinza padrão
};

export const StatusChip: React.FC<{ status: string }> = ({ status }) => {
    return (
        <Chip
            size="small"
            label={status}
            sx={{
                bgcolor: getStatusColor(status),
                color: 'white',
                fontWeight: 500,
            }}
        />
    )

}
export const PaymentChip: React.FC<{ method: string, portion?: number }> = ({ method }) => {
    //const label = `${getMethodTransaction(method)?.label || ''}${portion ? ` ${portion}x` : ''}`;
    return (
        <Chip
            size="small"
            label={getMethodTransaction(method)?.label || ''}
            sx={{
                bgcolor: getMethodTransaction(method)?.color || 'primary.main',
                color: 'white',
                fontWeight: 500,
            }}
        />
    )

}