import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { ILeadsPrincipal } from '../../../entities/Iecb';
import { Typography } from '@mui/material';
import { formatDateTime, toTel } from '../../../utils/functions';
import { CopyToClipboard } from '../../../utils/CopyToClipboard';
import * as LucideIcons from 'lucide-react';

interface ILeadsPrincipalCardProps {
    row: ILeadsPrincipal;
    handleOpenDetalhe?: (lead: ILeadsPrincipal) => void;
    handleOpenComentarios: (lead: ILeadsPrincipal) => void;
    showSelecao?: boolean;
    statusColor: string;
}

export const LeadsPrincipalCard: React.FC<ILeadsPrincipalCardProps> = ({ statusColor, showSelecao = true, row, handleOpenComentarios }) => {

    return (
        <Box sx={{ minWidth: 300, maxWidth: 500 }}>
            <Card sx={{ position: 'relative', background: '' }} variant="outlined">
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 1 }} >
                    <Box display='flex' justifyContent='space-between'>
                        <CardTextLucideIcon
                            iconName={'user'}
                            iconColor={'#0066ff'}
                            fontWeight={500}
                        >
                            {row.nome || 'Sem nome'}
                        </CardTextLucideIcon>
                        {showSelecao && row.selecao && (
                            <LucideIcons.Square
                                size={10}
                                fill={statusColor}
                                />
                        )}
                    </Box>

                    <CardTextLucideIcon
                        toCopy={row.telefone}
                        iconName={'phone'}
                        iconColor={'mediumseagreen'}
                        
                    >
                        {toTel(String(row.telefone))}
                    </CardTextLucideIcon>

                    {row.interesse && (
                        <CardTextLucideIcon
                            iconName={'graduationCap'}
                            iconColor={'#f5a623'}
                            fontWeight={500}
                        >
                            {row.interesse}
                        </CardTextLucideIcon>
                    )}

                    <Box display='flex' gap={2}>
                        <CardTextLucideIcon
                            iconName={'calendar'}
                            iconColor={'#999'}
                        >
                            {formatDateTime(row.dataCadastro)}
                        </CardTextLucideIcon>
                        {row.usuario && (
                            <CardTextLucideIcon
                                iconName={'AtSign'}
                                iconColor={'darkgreen'}
                            >
                                {row.usuario}
                            </CardTextLucideIcon>
                        )}
                    </Box>
                </CardContent>
                <CardActions sx={{
                    position: 'absolute',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    bottom: 0,
                    right: 5,
                    p: 0
                }}>
                    {row.id && (
                        <Button
                            onClick={() => handleOpenComentarios(row)}
                            color='primary'
                            size="small"
                        >
                            Detalhe
                        </Button>
                    )}
                </CardActions>
            </Card>
        </Box>
    );
}


interface MenuIconProps {
    icon: string;
    size?: number;
    color?: string;
    className?: string;
}

const MenuIcon: React.FC<MenuIconProps> = ({
    icon,
    size = 22,
    color = 'currentColor',
    className
}) => {
    // Converter nome do ícone para PascalCase se necessário
    const iconName = icon.charAt(0).toUpperCase() + icon.slice(1);

    // Buscar o componente do ícone no lucide-react
    const IconComponent = (LucideIcons as any)[iconName];

    // Se não encontrar o ícone, usar um ícone padrão
    if (!IconComponent) {
        console.warn(`Icon "${icon}" not found in lucide-react, using default icon`);
        return (
            <LucideIcons.AlertCircle
                size={size}
                color={color}
                className={className}
            />
        );
    }

    return (
        <IconComponent
            size={size}
            color={color}
            className={className}
        />
    );
};

interface CardTextIconProps {
    children: React.ReactNode;
    iconName?: string;
    iconColor?: string;
    fontWeight?: number;
    toCopy?: string;
    textColor?: string;
}

const CardTextLucideIcon: React.FC<CardTextIconProps> = ({ children, iconName, iconColor, textColor = '#444', fontWeight, toCopy }) => {

    return (
        <Box display={'flex'} alignItems={'center'} gap={0.5}>

            <MenuIcon icon={iconName ?? 'Asterisk'} color={iconColor || '#2e6aec'} size={13} />

            <Typography
                color={textColor}
                fontSize={'0.75rem'}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                variant="subtitle1"
                fontWeight={fontWeight}
            >
                {children}
            </Typography>
            {toCopy &&
                <CopyToClipboard
                    fontSize={16}
                    text={toCopy}
                    tooltipTitle="Copiar"
                    successTooltipTitle="Copiado!"
                />}
        </Box>
    );
};
