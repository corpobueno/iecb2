import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../../../components/containers/PageContainer';
import { ColaboradorForm } from './ColaboradorForm';
import { IColaboradorForm } from '../../../entities/Rh';
import { useVForm } from '../../../components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ColaboradorService } from '../../../api/services/rh';
import { useEffect, useState } from 'react';
import { SaveToolbar } from '../../../components/contents/SaveToolBar';
import { useSnackbar } from '../../../contexts/SnackBarProvider';

const formValidationSchema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório').min(2, 'Nome deve ter no mínimo 2 caracteres'),
  cpf: yup.string().optional(),
  rg: yup.string().optional(),
  dataNascimento: yup.string().optional(),
  genero: yup.string().optional(),
  estadoCivil: yup.string().optional(),
  telefone: yup.string().optional(),
  email: yup.string().email('E-mail inválido').optional(),
  endereco: yup.string().optional(),
  cidade: yup.string().optional(),
  estado: yup.string().optional(),
  cep: yup.string().optional(),
  cargo: yup.string().optional(),
  setor: yup.string().optional(),
  dataAdmissao: yup.string().optional(),
  dataDemissao: yup.string().optional(),
  tipoContrato: yup.string().optional(),
  salario: yup.number().optional().nullable().transform((value) => (isNaN(value) ? undefined : value)),
  experienciaInicio: yup.string().optional(),
  experienciaFim: yup.string().optional(),
  experienciaStatus: yup.string().optional(),
  status: yup.string().optional(),
});

const initialValues: IColaboradorForm = {
  nome: '',
  cpf: '',
  rg: '',
  dataNascimento: '',
  genero: undefined,
  estadoCivil: '',
  telefone: '',
  email: '',
  endereco: '',
  cidade: '',
  estado: '',
  cep: '',
  cargo: '',
  setor: '',
  dataAdmissao: '',
  dataDemissao: '',
  tipoContrato: 'CLT',
  salario: undefined,
  experienciaInicio: '',
  experienciaFim: '',
  experienciaStatus: 'PENDENTE',
  status: 'ATIVO',
};

const ColaboradorRegister: React.FC = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showSnackbarMessage } = useSnackbar();
  const { save, ...methods } = useVForm<IColaboradorForm>({
    resolver: yupResolver(formValidationSchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<IColaboradorForm>(initialValues);

  useEffect(() => {
    if (!id) {
      setProject(initialValues);
      methods.reset(initialValues);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const resp = await ColaboradorService.getById(Number(id));
        if (resp instanceof Error) {
          showSnackbarMessage(resp.message, 'error');
          navigate('/rh/colaboradores');
          return;
        }
        setProject(resp);
        Object.keys(resp).forEach((key) => {
          methods.setValue(key as keyof IColaboradorForm, (resp as any)[key]);
        });
      } catch (error) {
        showSnackbarMessage((error as Error).message, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async (data: IColaboradorForm) => {
    setIsLoading(true);

    try {
      if (!isEdit) {
        const newId = await ColaboradorService.create(data);
        if (newId instanceof Error) {
          showSnackbarMessage(newId.message, 'error');
          return;
        }
        showSnackbarMessage('Colaborador cadastrado com sucesso');
        navigate(`/rh/colaboradores/${newId}`);
      } else {
        const result = await ColaboradorService.update(Number(id), data);
        if (result instanceof Error) {
          showSnackbarMessage(result.message, 'error');
          return;
        }
        showSnackbarMessage('Colaborador atualizado com sucesso');
      }
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este colaborador?')) return;

    try {
      const result = await ColaboradorService.deleteById(Number(id));
      if (result instanceof Error) {
        showSnackbarMessage(result.message, 'error');
        return;
      }
      showSnackbarMessage('Colaborador excluído com sucesso');
      navigate('/rh/colaboradores');
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    }
  };

  return (
    <PageContainer
      toolbar={
        <SaveToolbar
          showMenuButton={true}
          showNewButton={isEdit}
          showSaveButton={!isLoading}
          showDeleteButton={isEdit}
          onClickSave={() => save(handleSave)}
          onClickNew={() => navigate('/rh/colaboradores/cadastrar')}
          onClickBack={() => navigate('/rh/colaboradores')}
          onClickDelete={handleDelete}
        />
      }
    >
      <ColaboradorForm
        handleSave={handleSave}
        methods={methods}
        project={project}
        isLoading={isLoading}
        isEdit={isEdit}
      />
    </PageContainer>
  );
};

export default ColaboradorRegister;
