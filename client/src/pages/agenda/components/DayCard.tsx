import { memo, useCallback, useMemo } from "react";
import { Box, Card, CardActionArea, Tooltip, Typography } from "@mui/material";
import { IAgenda } from "../../../entities/Iecb";
import { formatDateTime } from "../../../utils/functions";
import { GraduationCap, UserStar } from "lucide-react";

interface DayCardProps {
  openForm: (card: IAgenda) => void;
  card: IAgenda;
  viewMode: 'week' | 'month';
  totalCards: number;
}

// Componente DayCard principal otimizado
export const DayCard = memo<DayCardProps>(({ openForm, card, viewMode, totalCards }) => {

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openForm(card);
  }, [card, openForm]);


  const tooltipContent = useMemo(() => (
    <Box>
      <Typography variant="body1" fontWeight={600}>
        {card.nomeCurso || 'Aula'}
      </Typography>
      <Typography
        component={CardActionArea}
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        variant="body1"
        fontWeight={600}
      >
        {formatDateTime(card.data + 'T' + card.hora)}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {card.nomeDocente}
      </Typography>

      <Typography variant="body2" fontWeight={600}>
        {card.hora} - {card.horaFim}
      </Typography>
      {card.nota !== '' && (
        <Typography variant="body1" fontWeight={600}>
          {card.usuario}: {card.nota}
        </Typography>
      )}
    </Box>
  ), [card]);

  const cardStyles = useMemo(() => ({
    boxSizing: 'border-box',
    border: '1px solid #ddd',
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",

    transform: 'scale(95%)',
    display: 'block',

    width: viewMode === 'month' ? `calc(100% / ${totalCards})` : '100%',
  }), [card]);
  // Renderiza o card normal
  return (
    <Tooltip title={tooltipContent} placement="top" arrow>
      <Card variant="outlined" sx={cardStyles} onClick={handleClick}>
        <Box sx={{ bgcolor: card.color+'99', p: 0.5}}>
          <CardText
            icon={GraduationCap}
            iconColor={card.cursoColor}
          >
            {card.nomeCurso || 'Aula'}
          </CardText>
          
                   <CardText
            icon={UserStar}
            iconColor={card.color}
          >
            {card.nomeDocente}

          </CardText>
        
        </Box>
      </Card>
    </Tooltip>
  );
});

interface CardTextProps {
  children: React.ReactNode
  icon?: React.ComponentType<any>
  iconColor?: string
  iconSize?: number
  iconBg?: string
  fontWeight?: number
  fontSize?: string
  textColor?: string
  variant?: 'subtitle2' | 'subtitle1' | 'body2'
}

export const CardText = memo<CardTextProps>(({
  children,
  icon: Icon,
  iconColor,
  iconSize = 15,
  iconBg,
  fontWeight = 400,
  fontSize = '0.85rem',
  textColor,
  variant = 'subtitle2'
}) => (
  <Box display="flex" alignItems="center">
    {Icon && (
      <Box sx={{
        mr: 0.4,
        mb: iconBg ? -0.1 : 0,
        mt: iconBg ? 0 : 0.1,
        display: 'flex',
        alignItems: 'center'
      }}>
        <Icon
          size={iconSize}
          color={iconColor}
          style={iconBg ? { background: iconBg, borderRadius: 8, padding: 1 } : undefined}
        />
      </Box>
    )}
    <Typography
      fontSize={fontSize}
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      variant={variant}
      fontWeight={fontWeight}
      color={textColor}
      sx={{ m: 0.1 }}
    >
      {children}
    </Typography>
  </Box>
))