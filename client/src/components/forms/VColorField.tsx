import React, { useState } from 'react';
import { TextField, Popover, Box, IconButton, BaseTextFieldProps, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { HexColorPicker } from 'react-colorful';
import { Palette as PaletteIcon } from '@mui/icons-material';


// VColorField - Campo de Cor com Color Picker
type VColorFieldProps = Omit<BaseTextFieldProps, 'InputProps'> & {
  showPreview?: boolean;
  InputProps?: Omit<TextFieldProps['InputProps'], 'endAdornment'>;
}

export const VColorField: React.FC<VColorFieldProps> = ({ 
  name, 
  showPreview = true,
  ...rest 
}) => {
  const { control } = useFormContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenColorPicker = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseColorPicker = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Controller
      name={name ?? ''}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          <TextField
            {...rest}
            {...field}
            id={name}
            type="text"
            error={!!error}
            helperText={error?.message}
            placeholder="#000000"
            InputLabelProps={{
              shrink: !!field.value
            }}
            InputProps={{
              ...rest.InputProps,
              endAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {showPreview && (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        border: '1px solid #ccc',
                        backgroundColor: field.value || '#ffffff',
                        cursor: 'pointer'
                      }}
                      onClick={handleOpenColorPicker}
                    />
                  )}
                  <IconButton
                    size="small"
                    onClick={handleOpenColorPicker}
                    sx={{ p: 0.5 }}
                  >
                    <PaletteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )
            }}
          />
          
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleCloseColorPicker}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box sx={{ p: 2 }}>
              <HexColorPicker
                color={field.value || '#ffffff'}
                onChange={(color) => field.onChange(color)}
              />
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <TextField
                  size="small"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="#000000"
                  inputProps={{
                    style: { textAlign: 'center' }
                  }}
                />
              </Box>
            </Box>
          </Popover>
        </>
      )}
    />
  );
};