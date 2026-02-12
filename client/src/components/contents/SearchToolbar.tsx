import { Box, Button, Icon, Paper, TextField, Typography, useTheme } from '@mui/material';

interface ISearchToolbarProps {
  children?: React.ReactNode;
  showMenuButton?: boolean;
  textSearch?: string;
  showInputSearch?: boolean;
  handleSearchChange?: (newText: string) => void;
  textNewButton?: string;
  showNewButton?: boolean;
  showBackButton?: boolean;
  onClickNew?: () => void;
  onClickBack?: () => void;
}

export const SearchToolbar: React.FC<ISearchToolbarProps> = ({
  children,
  textSearch = '',
  handleSearchChange,
  showInputSearch = false,
  onClickNew,
  onClickBack,
  textNewButton = 'Novo',
  showNewButton = true,
  showBackButton = false,
}) => {
  const theme = useTheme();

  return (
    <Paper
      variant='outlined'
      sx={{
        gap: 2,
        marginX: 1,
        marginBottom: 1,
        padding: 1,
        paddingX: 2,
        display: "flex",
        alignItems: "center",
        height: theme.spacing(5),

      }}
    >
      {showInputSearch && (
        <TextField
          size="small"
          value={textSearch}
          placeholder={'Pesquisar...' }
          onChange={(e) => handleSearchChange?.(e.target.value)}
        />
      )}

      {children}



      <Box flex={1} display="flex" justifyContent="end">
        {showNewButton && (
          <Button
            color='primary'
            disableElevation
            variant='contained'
            onClick={onClickNew}
            endIcon={<Icon>add</Icon>}
          >{textNewButton}</Button>
        )}

        {showBackButton && (
          <Button
            color='primary'
            disableElevation
            variant='outlined'
            onClick={onClickBack}
            startIcon={<Icon>arrow_back</Icon>}
          >
            <Typography variant='button' whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
             voltar
            </Typography>
          </Button>
        )}

      </Box>
    </Paper>
  );
};
