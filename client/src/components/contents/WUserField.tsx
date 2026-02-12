import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, TextFieldProps, CircularProgress } from '@mui/material';
import { UserService } from '../../api/services/UserService';
import { IUser } from '../../entities/User';

type TWUserFieldProps = Omit<TextFieldProps, 'name' | 'value' | 'onChange'> & {
  name: string;
  value?: string;
  handleChange: (value: string) => void;
  isExternalLoading?: boolean;
  label?: string;
}

export const WUserField: React.FC<TWUserFieldProps> = ({
  name,
  value,
  handleChange,
  isExternalLoading = false,
  label = 'Usuário',
  ...rest
}) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  // Carrega a lista de usuários quando o componente é montado
  useEffect(() => {
    loadUsers();
  }, []);

  // Carrega o usuário selecionado quando o valor muda
  useEffect(() => {
    if (value && typeof value === 'string' && value.length > 0) {
      loadUserByUsername(value);
    } else {
      setSelectedUser(null);
    }
  }, [value]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await UserService.find({});
      if (!(response instanceof Error)) {
        setUsers(response.data);
      } else {
        console.error("Erro ao carregar usuários:", response.message);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserByUsername = async (username: string) => {
    if (!username) return;

    try {
      const response = await UserService.getByUsername(username);
      if (!(response instanceof Error)) {
        setSelectedUser(response);
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      setSelectedUser(null);
    }
  };

  return (
    <Autocomplete
      options={users}
      loading={loading || isExternalLoading}
      disabled={isExternalLoading}
      getOptionLabel={(option) => {
        // Verificar se option é um objeto com propriedade name ou é apenas o username
        if (typeof option === 'object' && option !== null && 'name' in option) {
          return option.name;
        }

        // Se for o username como string
        if (typeof option === 'string') {
          const user = users.find(u => u.username === option);
          return user ? user.name : `Usuário #${option}`;
        }

        // Qualquer outro caso
        return String(option);
      }}
      value={selectedUser || (value ? users.find(u => u.username === value) : null)}
      onChange={(_, newValue) => {
        if (newValue && typeof newValue === 'object' && 'username' in newValue) {
          handleChange(newValue.username);
          setSelectedUser(newValue);
        } else {
          handleChange('');
          setSelectedUser(null);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          {...rest}
          name={name}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading || isExternalLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
