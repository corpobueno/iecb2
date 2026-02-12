import { useState, MouseEvent, ReactNode } from 'react';
import {
  Button,
  Popover,
  Box,
  Typography,
  Divider,
  IconButton,
  Badge,
} from '@mui/material';
import { Filter, X } from 'lucide-react';

export interface FilterField {
  name: string;
  label: string;
  component: ReactNode;
}

interface FilterButtonProps {
  filters: FilterField[];
  onClearFilters?: () => void;
  activeFiltersCount?: number;
}

export const FilterButton = ({
  filters,
  onClearFilters,
  activeFiltersCount = 0,
}: FilterButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'filter-popover' : undefined;

  return (
    <>
      <Badge
        badgeContent={activeFiltersCount}
        color="primary"
        invisible={activeFiltersCount === 0}
      >
        <Button
          variant="outlined"
          startIcon={<Filter size={18} />}
          onClick={handleClick}
          color="primary"
          size="small"
        >
          Filtros
        </Button>
      </Badge>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 320,
              maxWidth: 500,
              p: 2,
            }
          }
        }}
      >
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtros
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {activeFiltersCount > 0 && onClearFilters && (
              <Button
                size="small"
                variant="text"
                color="error"
                startIcon={<X size={16} />}
                onClick={handleClearFilters}
              >
                Limpar
              </Button>
            )}
            <IconButton size="small" onClick={handleClose}>
              <X size={18} />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filters.map((filter, index) => (
            <Box key={filter.name || index}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}
              >
                {filter.label}
              </Typography>
              {filter.component}
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};
