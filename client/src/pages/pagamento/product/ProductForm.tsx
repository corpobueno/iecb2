import { Grid, MenuItem, Autocomplete, TextField, CircularProgress } from '@mui/material';
import { VTextField, VFormContainer, VCash } from '../../../components/forms';
import { ILancamentoForm, IAcompanhamento, IProduto, IDocente } from '../../../entities/Iecb';
import { useEffect, useState, useRef } from 'react';
import { AcompanhamentoService } from '../../../api/services/AcompanhamentoService';
import { ProdutoService } from '../../../api/services/ProdutoService';
import { DocenteService } from '../../../api/services/DocenteService';
import { useDebounce } from '../../../hooks/UseDebounce';
import { Controller } from 'react-hook-form';

interface Props {
  handleSave: (data: ILancamentoForm) => void;
  methods: any;
  isLoading?: boolean;
  project: ILancamentoForm;
  defaultIdCliente?: number;
}

export const ProductForm = ({ handleSave, isLoading = false, project, methods, defaultIdCliente }: Props) => {
  const [clientes, setClientes] = useState<IAcompanhamento[]>([]);
  const [produtos, setProdutos] = useState<IProduto[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<IProduto[]>([]);
  const [docentes, setDocentes] = useState<IDocente[]>([]);
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteLoading, setClienteLoading] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<IAcompanhamento | null>(null);
  const [produtoSearch, setProdutoSearch] = useState('');
  const [produtoLoading, setProdutoLoading] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<IProduto | null>(null);
  const { debounce } = useDebounce(400);
  const { debounce: debounceProduto } = useDebounce(300);
  const isInitialized = useRef(false);

  useEffect(() => {
    ProdutoService.findAll().then((resp) => {
      if (!(resp instanceof Error)) {
        setProdutos(resp.data);
        setProdutosFiltrados(resp.data);
      }
    });

    DocenteService.find().then((resp) => {
      if (!(resp instanceof Error)) {
        setDocentes(resp.data);
      }
    });
  }, []);

  useEffect(() => {
    setProdutoLoading(true);
    debounceProduto(() => {
      if (produtoSearch.trim() === '') {
        setProdutosFiltrados(produtos);
      } else {
        const filtered = produtos.filter(p =>
          p.nome.toLowerCase().includes(produtoSearch.toLowerCase())
        );
        setProdutosFiltrados(filtered);
      }
      setProdutoLoading(false);
    });
  }, [produtoSearch, produtos, debounceProduto]);

  useEffect(() => {
    setClienteLoading(true);
    debounce(() => {
      AcompanhamentoService.find(1, clienteSearch).then((resp) => {
        setClienteLoading(false);
        if (!(resp instanceof Error)) {
          setClientes(resp.data);
        }
      });
    });
  }, [clienteSearch, debounce]);

  useEffect(() => {
    // Só executa na primeira renderização para não resetar valores preenchidos
    if (isInitialized.current) return;
    isInitialized.current = true;

    if (defaultIdCliente && !project.idCliente) {
      methods.setValue('idCliente', defaultIdCliente);
      // Buscar cliente pelo ID para mostrar no autocomplete
      AcompanhamentoService.getById(defaultIdCliente).then((resp) => {
        if (!(resp instanceof Error)) {
          setSelectedCliente(resp);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Quando clientes são carregados, verificar se há um cliente selecionado pelo ID
    if (clientes.length > 0 && project.idCliente && !selectedCliente) {
      const cliente = clientes.find(c => c.id === project.idCliente);
      if (cliente) {
        setSelectedCliente(cliente);
      }
    }
  }, [clientes, project.idCliente, selectedCliente]);

  useEffect(() => {
    // Quando produtos são carregados, verificar se há um produto selecionado pelo ID
    if (produtos.length > 0 && project.produto && !selectedProduto) {
      const produto = produtos.find(p => p.id === project.produto);
      if (produto) {
        setSelectedProduto(produto);
      }
    }
  }, [produtos, project.produto, selectedProduto]);

  return (
    <VFormContainer sx={{ maxHeight: 'calc(100vh - 90px)', overflow: 'auto' }} methods={methods} handleSave={handleSave}>
      <Grid container item direction="row" spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="idCliente"
            control={methods.control}
            render={({ field, fieldState }) => (
              <Autocomplete
                disabled={isLoading}
                options={clientes}
                getOptionLabel={(option) => option.nome || ''}
                value={selectedCliente}
                loading={clienteLoading}
                onInputChange={(_, newInputValue) => {
                  setClienteSearch(newInputValue);
                }}
                onChange={(_, newValue) => {
                  setSelectedCliente(newValue);
                  field.onChange(newValue?.id || 0);
                }}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cliente"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {clienteLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="produto"
            control={methods.control}
            render={({ field, fieldState }) => (
              <Autocomplete
                disabled={isLoading}
                options={produtosFiltrados}
                getOptionLabel={(option) => option.nome || ''}
                value={selectedProduto}
                loading={produtoLoading}
                onInputChange={(_, newInputValue) => {
                  setProdutoSearch(newInputValue);
                }}
                onChange={(_, newValue) => {
                  setSelectedProduto(newValue);
                  field.onChange(newValue?.id || 0);
                  // Preencher valor com o preço de venda do produto
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const preco = newValue?.precoVenda || (newValue as any)?.preco_venda;
                  if (preco) {
                    methods.setValue('valor', preco);
                  }
                }}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Produto"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {produtoLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <VCash
            disabled={isLoading}
            fullWidth
            label="Valor"
            name="valor"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Quantidade"
            name="qnt"
            type="number"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <VTextField
            select
            disabled={isLoading}
            fullWidth
            label="Forma de Pagamento"
            name="idPagamento"
          >
            <MenuItem value={2}>Dinheiro</MenuItem>
            <MenuItem value={17}>PIX</MenuItem>
            <MenuItem value={1}>Cartão Débito</MenuItem>
            <MenuItem value={4}>Cartão Crédito</MenuItem>
            <MenuItem value={16}>Crédito Cliente</MenuItem>
          </VTextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <VTextField
            select
            disabled={isLoading}
            fullWidth
            label="Vendedor"
            name="usuario"
          >
            {docentes.map((docente) => (
              <MenuItem key={docente.id} value={docente.login}>
                {docente.nome}
              </MenuItem>
            ))}
          </VTextField>
        </Grid>
      </Grid>
    </VFormContainer>
  );
};
