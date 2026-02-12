import {
  styled, alpha, useTheme, Paper, Table, TableCell, TableContainer, TableHead, TableRow, TableFooter, LinearProgress, Box,
  Typography,
  IconButton,
  Icon,
  Collapse,
  TableBody,
} from '@mui/material';
import { useState, useEffect, forwardRef } from 'react';
import { scrollStyle } from '../../utils/styles';
import { useAppThemeContext } from '../../contexts';
import { Edit } from 'lucide-react';
import { blueGrey } from '@mui/material/colors';
import { useWindowSize } from '../../hooks/useWindowSize';

interface IVTableProps {
  titles: any[];
  overflow?: string;
  children: React.ReactNode;
  headerHeight?: number;
  h?: string | number | null;
  size?: 'small' | 'medium';
}

export const VTable = forwardRef<HTMLDivElement, IVTableProps>(({ size = 'small', titles, children, headerHeight = 20, overflow = 'auto', h = null }, ref) => {
  const [tableHeight, setTableHeight] = useState(window.innerHeight / 7.7 - headerHeight);

  useEffect(() => {
    const handleResize = () => setTableHeight(window.innerHeight / 7.7 - headerHeight);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [headerHeight]);

  const theme = useTheme();
  const { windowHeight } = useWindowSize()
  return (
    <TableContainer
      ref={ref}
      component={Paper}
      variant="outlined"
      sx={{
        maxHeight: h ? h === 'full' ? '100%' : `calc( ${windowHeight}px - ${h} )` : theme.spacing(tableHeight > 100 ? 100 : tableHeight),
        overflow: overflow,
        mx: 1,
        width: 'auto',
        ...scrollStyle
      }}
    >
      <Table stickyHeader size={size}>
        <TableHead>
          <TableRow>
            {titles.map((title, index) => (
              <TableCell key={index}>{title}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        {children}
      </Table>
    </TableContainer>
  );
});

VTable.displayName = 'VTable';

interface IVTableFooterProps {
  colSpan: number;
  children: React.ReactNode;
  isLoading?: boolean;
}

export const VTableFooter = ({ isLoading = false, children, colSpan }: IVTableFooterProps) => {
  const { theme } = useAppThemeContext();
  return (

    <TableFooter sx={{ position: 'sticky', bottom: 0, width: '100%', zIndex: 10 }} >

      {isLoading && (
        <TableRow>

          <TableCell colSpan={colSpan} >

            <LinearProgress variant='indeterminate' />

          </TableCell>
        </TableRow>
      )}
      <TableRow sx={{ background: theme.palette.background.paper }} >
        <TableCell colSpan={colSpan}>
          
          {children}

        </TableCell>
      </TableRow>
    </TableFooter>


  )
}

const MainTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  '& > *': {
    borderBottom: 'unset',
    fontWeight: 500,
  },
}));

const ExpandableCell = styled(TableCell)(({ theme }) => ({
  paddingBottom: 0,
  paddingTop: 0,
  backgroundColor: alpha(theme.palette.grey[100], 0.3),
}));

const SubTableContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2),
  marginLeft: theme.spacing(4),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  boxShadow: `inset 2px 0 4px ${alpha(theme.palette.primary.main, 0.05)}`,
}));

const SubTable = styled(Table)(({ theme }) => ({
  backgroundColor: 'transparent',
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
    fontSize: '0.875rem',
  },
}));

const SubTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  '&:last-child .MuiTableCell-root': {
    borderBottom: 'none',
  },
}));

const SubTableHeader = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: theme.palette.primary.dark,
    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const DescriptionText = styled(Typography)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1.5),
  paddingLeft: theme.spacing(1),
  borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
}));

const ActionButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  alignItems: 'center',
}));

const ExpandButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'expanded'
})<{ expanded: boolean }>(({ theme, expanded }) => ({
  color: theme.palette.primary.main,
  transition: 'all 0.3s ease',
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));


const SubEditButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.info.main,
  fontSize: '0.875rem',
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: alpha(theme.palette.info.main, 0.1),
  },
}));

// Component Interfaces
interface VExpandableRowProps {
  showEdit?: boolean;
  children: React.ReactNode;
  onEdit?: () => void;
  onToggleExpand: () => void;
  expanded: boolean;
  editIcon?: any;
}

interface VExpandableCellProps {
  children: React.ReactNode;
  colSpan: number;
}

interface VSubTableProps {
  headers: string[];
  children: React.ReactNode;
  description?: string | null;
  showEdit?: boolean;

}

interface VSubTableRowProps {
  children: React.ReactNode;
  onEdit?: () => void;


}

// Main Components
export const VExpandableRow: React.FC<VExpandableRowProps> = ({
  editIcon,
  children,
  onEdit,
  onToggleExpand,
  expanded,
  showEdit = true,
}) => {
  

  return (
    <MainTableRow>
      <TableCell>
        <ActionButtonGroup>
          <ExpandButton
            size="small"
            onClick={onToggleExpand}
            expanded={expanded}
            title={expanded ? 'Recolher' : 'Expandir'}
          >
            <Icon>expand_more</Icon>
          </ExpandButton>
          {showEdit && (
            editIcon ??
            <Edit size={20} color={blueGrey[800]} onClick={onEdit} />
          )}
        </ActionButtonGroup>
      </TableCell>
      {children}
    </MainTableRow>
  );
};

export const VExpandableCell: React.FC<VExpandableCellProps> = ({
  children,
  colSpan,
}) => {
  return (
    <TableRow>
      <ExpandableCell colSpan={colSpan}>
        {children}
      </ExpandableCell>
    </TableRow>
  );
};

export const VSubTable: React.FC<VSubTableProps> = ({
  headers,
  children,
  description,
  showEdit = false,
}) => {
  return (
    <Collapse in timeout="auto" unmountOnExit>
      <SubTableContainer>
        {description && (
          <DescriptionText variant="body2">
            {description}
          </DescriptionText>
        )}
        <SubTable size="small">
          <SubTableHeader>
            <TableRow>
              {showEdit && <TableCell width="60px"></TableCell>}
              {headers.map((header, index) => (
                <TableCell key={index}>{header}</TableCell>
              ))}
            </TableRow>
          </SubTableHeader>
          <TableBody>
            {children}
          </TableBody>
        </SubTable>
      </SubTableContainer>
    </Collapse>
  );
};

export const VSubTableRow: React.FC<VSubTableRowProps> = ({
  children,
  onEdit,
}) => {
  return (
    <SubTableRow>
      {onEdit && (
        <TableCell>

          <SubEditButton size="small" onClick={onEdit} title="Editar">
            <Icon fontSize="small">edit</Icon>
          </SubEditButton>

        </TableCell>
      )}
      {children}
    </SubTableRow>
  );
};

// Empty State Component
export const VSubTableEmpty: React.FC<{ message: string }> = ({ message }) => (
  <SubTableRow>
    <TableCell colSpan={5} align="center">
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        {message}
      </Typography>
    </TableCell>
  </SubTableRow>
);