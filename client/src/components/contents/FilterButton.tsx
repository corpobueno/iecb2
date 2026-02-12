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

export interface IFilterInputs {
  content: any[];
  isChecked: boolean[];
}

interface Props {
  filterInputs: IFilterInputs;
  clear?: () => void | false;
  disabled?: boolean;
}

export const FilterButton: React.FC<Props> = ({ filterInputs, clear }) => {
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
            backgroundColor: 'background.default',
            color: 'text.primary',
            maxWidth: 300,
            maxHeight: 300,
            overflowY: "auto",
          },
        }}
      >
        <Box>
          <Grid container spacing={2}>
            {filterInputs.content.map((item, index) => (
              <Grid item xs={12} key={index}>
                {item}
              </Grid>
            ))}
          </Grid>

          {/* Botão para limpar filtros */}
          {clear && (
            <Box mt={2} >
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
