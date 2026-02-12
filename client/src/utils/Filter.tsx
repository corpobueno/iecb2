import React, { useState } from "react";
import {
  Box,
  Grid,
  Icon,
  IconButton,
  Popover,
  Badge,
  Button,
} from "@mui/material";
import { useAppThemeContext } from "../contexts";

export interface IFilterInputs {
  content: React.ReactElement[];
  isChecked: boolean[];
}

interface Props {
  filterInputs: IFilterInputs;
  clear?: () => void | false;
}

export const FilterButton: React.FC<Props> = ({ filterInputs, clear }) => {
  const { theme } = useAppThemeContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Calcula a quantidade de filtros definidos
  const filtersCount = filterInputs.isChecked.filter((isActive) => !isActive).length;

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Badge
          badgeContent={filtersCount} // Exibe o número de filtros definidos
          color="primary"
          overlap="circular"
        >
          <Icon>filter_list</Icon>
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            p: 2,
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            maxWidth: 400,
            maxHeight: 300,
            overflowY: "auto",
          },
        }}
      >
        <Box>
          <Grid container spacing={1}>
            {filterInputs.content.map((item, index) => (
              <Grid item key={index}>
                {item}
              </Grid>
            ))}
          </Grid>

          {/* Botão para limpar filtros */}
          {clear && (
            <Box mt={2} textAlign="right">
              <Button
                
                color="primary"
                onClick={() => {
                  clear(); // Chama a função clear para limpar os filtros
                  handleClose(); // Fecha o Popover após limpar os filtros
                }}
              >
                Limpar Filtros
              </Button>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};
