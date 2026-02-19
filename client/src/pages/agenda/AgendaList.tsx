import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  IconButton,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CalendarMonth,
  ViewWeek,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AgendaService } from '../../api/services/AgendaService';
import { PageContainer } from '../../components/containers/PageContainer';
import { IAgenda } from '../../entities/Iecb';
import { useSnackbar } from '../../contexts/SnackBarProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { SaveToolbar } from '../../components/contents/SaveToolBar';
import { DayCard } from './components/DayCard';
import { AgendaDetails } from './components/AgendaDetails';
import { lightBlue } from '@mui/material/colors';

dayjs.locale('pt-br');

type ViewMode = 'month' | 'week';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const AgendaList = () => {
  const theme = useTheme();
  const { showSnackbarMessage } = useSnackbar();
  const navigate = useNavigate();

  const [agendas, setAgendas] = useState<IAgenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedAgenda, setSelectedAgenda] = useState<IAgenda | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Calcula as datas de inicio e fim do periodo
  const { startDate, endDate, days } = useMemo(() => {
    let start: dayjs.Dayjs;
    let end: dayjs.Dayjs;

    if (viewMode === 'week') {
      start = currentDate.startOf('week');
      end = currentDate.endOf('week');
    } else {
      start = currentDate.startOf('month').startOf('week');
      end = currentDate.endOf('month').endOf('week');
    }

    const daysArray: dayjs.Dayjs[] = [];
    let day = start;
    while (day.isBefore(end) || day.isSame(end, 'day')) {
      daysArray.push(day);
      day = day.add(1, 'day');
    }

    return {
      startDate: start,
      endDate: end,
      days: daysArray,
    };
  }, [currentDate, viewMode]);

  // Agrupa agendas por data
  const agendasByDate = useMemo(() => {
    const grouped: Record<string, IAgenda[]> = {};
    agendas.forEach((agenda) => {
      const dateKey = agenda.data;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(agenda);
    });
    // Ordena cada dia por hora
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.hora.localeCompare(b.hora));
    });
    return grouped;
  }, [agendas]);

  const loadData = async () => {
    setIsLoading(true);
    const result = await AgendaService.findByPeriodo(
      startDate.format('YYYY-MM-DD'),
      endDate.format('YYYY-MM-DD')
    );

    if (result instanceof Error) {
      showSnackbarMessage(result.message, 'error');
    } else {
      setAgendas(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const handlePrev = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => prev.subtract(1, 'week'));
    } else {
      setCurrentDate((prev) => prev.subtract(1, 'month'));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => prev.add(1, 'week'));
    } else {
      setCurrentDate((prev) => prev.add(1, 'month'));
    }
  };

  const handleToday = () => {
    setCurrentDate(dayjs());
  };

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
    if (newView) {
      setViewMode(newView);
    }
  };

  const handleAgendaClick = (agenda: IAgenda) => {
    setSelectedAgenda(agenda);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedAgenda(null);
  };

  const handleDayClick = (day: dayjs.Dayjs) => {
    navigate(`/agenda/cadastrar?data=${day.format('YYYY-MM-DD')}`);
  };

  const isToday = (day: dayjs.Dayjs) => day.isSame(dayjs(), 'day');
  const isCurrentMonth = (day: dayjs.Dayjs) => day.month() === currentDate.month();

  const getTitle = () => {
    if (viewMode === 'week') {
      const weekStart = currentDate.startOf('week');
      const weekEnd = currentDate.endOf('week');
      if (weekStart.month() === weekEnd.month()) {
        return `${weekStart.format('D')} - ${weekEnd.format('D')} de ${weekEnd.format('MMMM YYYY')}`;
      }
      return `${weekStart.format('D MMM')} - ${weekEnd.format('D MMM YYYY')}`;
    }
    return currentDate.format('MMMM YYYY');
  };

  return (
    <PageContainer
      toolbar={
        <SaveToolbar
          showSaveButton={false}
          showBackButton={false}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              width: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={handlePrev}>
                <ChevronLeft />
              </IconButton>
              <IconButton onClick={handleNext}>
                <ChevronRight />
              </IconButton>
              <Chip label="Hoje" onClick={handleToday} variant="outlined" size="small" />
              <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
                {getTitle()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewChange}
                size="small"
              >
                <ToggleButton value="week">
                  <ViewWeek sx={{ mr: 0.5 }} fontSize="small" />
                  Semana
                </ToggleButton>
                <ToggleButton value="month">
                  <CalendarMonth sx={{ mr: 0.5 }} fontSize="small" />
                  Mes
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </SaveToolbar>
      }
    >


      {/* Calendar Grid */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          mx: 1
        }}
      >
        {/* Weekday Headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.grey[100],
          }}
        >
          {WEEKDAYS.map((day) => (
            <Box
              key={day}
              sx={{
                p: 1,
                textAlign: 'center',
                fontWeight: 600,
                color: theme.palette.text.secondary,
              }}
            >
              <Typography variant="caption">
                {day}
              </Typography>

            </Box>
          ))}
        </Box>

        {/* Days Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridAutoRows: viewMode === 'week' ? 'calc(100vh - 200px)' : '1fr',
            height: viewMode === 'month' ? 'calc(100vh - 120px)' : 'auto',
          }}
        >
          {days.map((day, index) => {
            const dateKey = day.format('YYYY-MM-DD');
            const dayAgendas = agendasByDate[dateKey] || [];
            const today = isToday(day);
            const currentMonth = isCurrentMonth(day);

            return (
              <Box
                key={dateKey}
                sx={{
                  borderRight: (index + 1) % 7 !== 0 ? `1px solid ${theme.palette.divider}` : 'none',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  p: 0.5,
                  overflow: 'auto',
                  bgcolor: !currentMonth && viewMode === 'month'
                    ? theme.palette.grey[50]
                    : 'transparent',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
                onClick={() => handleDayClick(day)}
              >
                {/* Day Number */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: today ? theme.palette.primary.main : lightBlue[50],
                      color: today
                        ? theme.palette.primary.contrastText
                        : !currentMonth && viewMode === 'month'
                          ? theme.palette.text.disabled
                          : theme.palette.text.primary,
                      fontWeight: today ? 700 : 400,
                      fontSize: '0.875rem',
                    }}
                  >
                    <Typography variant="body2">
                      {day.date()}
                    </Typography>

                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(day);
                    }}
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '&:hover': { opacity: 1 },
                    }}
                    className="add-button"
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Box>

                {/* Agenda Cards */}
                <Box sx={{ display: 'flex', flexDirection: viewMode === 'month' ? 'row' : 'column', gap: 0.5, flex: 1, }}>
                  {dayAgendas.map((agenda) => (
                    <DayCard
                      key={agenda.id}
                      card={agenda}
                      openForm={handleAgendaClick}
                      viewMode={viewMode}
                      totalCards={dayAgendas.length}
                    />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Loading Overlay */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              zIndex: 1,
            }}
          >
            <Typography>Carregando...</Typography>
          </Box>
        )}
      </Paper>

      <AgendaDetails
        open={detailsOpen}
        onClose={handleCloseDetails}
        agenda={selectedAgenda}
        onRefresh={loadData}
      />
    </PageContainer>
  );
};

export default AgendaList;
