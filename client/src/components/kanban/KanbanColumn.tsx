import { useWindowSize } from "../../hooks/useWindowSize";
import { Box, Container, IconButton, Paper, Skeleton, TextField, Typography } from "@mui/material";
import { scrollStyle } from "../../layouts/styles";
import { ReactNode, useState } from "react";
import { Close, LaunchOutlined, Search } from "@mui/icons-material";

interface KanbanColumnProps {
  children: ReactNode;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  handleScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
  title?: string;
  subtitle?: string;
  color?: string;
  onEdit?: () => void;
  filter?: string;
  handleFilterChange?: (value: string) => void;
  skeletonComponent?: ReactNode;
  skeletonCount?: number;
  hideEditButton?: boolean;
  minWidth?: number;
  maxWidth?: number;
  customHeight?: string;
  extraActions?: ReactNode;
}

export const DefaultCardSkeleton: React.FC = () => (
  <Box sx={{
    p: 2,
    border: 1,
    borderColor: 'divider',
    borderRadius: 1,
    bgcolor: 'background.paper'
  }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
      <Skeleton variant="text" width="60%" height={18} />
      <Skeleton variant="rectangular" width={20} height={18} />
    </Box>
    <Skeleton variant="text" width="40%" height={20} />
    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
      <Skeleton variant="rectangular" width={40} height={18} />
      <Skeleton variant="rectangular" width={40} height={18} />
    </Box>
  </Box>
);

export const KanbanColumn : React.FC<KanbanColumnProps> = ({
  children,
  isLoading = false,
  isLoadingMore = false,
  handleScroll,
  containerRef,
  title,
  subtitle,
  color = 'transparent',
  onEdit,
  filter,
  handleFilterChange,
  skeletonCount = 6,
  hideEditButton = false,
  minWidth = 350,
  maxWidth = 350,
  customHeight,
  extraActions,
}: KanbanColumnProps) => {
  const { windowHeight } = useWindowSize();
  const [filterMode, setFilterMode] = useState(false);

  
  const renderSkeletons = () => (
    Array.from({ length: skeletonCount }).map((_, index) => (
      <Box key={`skeleton-${index}`}>
       <Skeleton/>
      </Box>
    ))
  );

  const height = customHeight || `calc(${windowHeight}px - ${title ? '95px' : '170px'})`;
  const containerHeight = customHeight || `calc(${windowHeight}px - ${title ? '110px' : '170px'})`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        minWidth,
        maxWidth,
        height,
        position: 'relative',
        bgcolor: color,
      }}
      component={Paper}
      variant="outlined"
    >
      {title && (
        <Box sx={{
          position: 'sticky',
          zIndex: 5,
          bgcolor: '#ffffffaa',
          borderRadius: '3px',
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {!filterMode ? (
            <>
              <Box>
                <Typography variant="h6">{title}</Typography>
                {subtitle && <Typography variant="caption" color='textSecondary'>{subtitle}</Typography>}
              </Box>

              <Box display="flex" alignItems="center">
                {handleFilterChange && (
                  <IconButton title="Buscar Cliente" onClick={() => setFilterMode(true)}>
                    <Search />
                  </IconButton>
                )}
                {extraActions}
                {onEdit && !hideEditButton && (
                  <IconButton title="Detalhes da Rota" onClick={onEdit}>
                    <LaunchOutlined/>
                  </IconButton>
                )}
              </Box>
            </>
          ) : (
            <TextField
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setFilterMode(false)}>
                    <Close />
                  </IconButton>
                ),
                sx: {
                  bgcolor: 'white',
                },
              }}
              size="small"
              value={filter}
              fullWidth
              placeholder={'Pesquisar...'}
              onChange={(e) => handleFilterChange?.(e.target.value)}
            />
          )}
        </Box>
      )}

      <Container
        ref={containerRef}
        onScroll={handleScroll}
        sx={{
          ...scrollStyle,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          height: containerHeight,
          position: 'relative',
        }}
      >
        {isLoading ? (
          renderSkeletons()
        ) : (
          children
        )}

        {isLoadingMore && (
          <>
            <Skeleton />
            <Skeleton />
          </>
        )}
      </Container>
    </Box>
  );
};
