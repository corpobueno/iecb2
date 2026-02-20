import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../../components/containers/PageContainer';
import { AcompanhamentoForm } from './AcompanhamentoForm';
import { IAcompanhamentoForm } from '../../entities/Iecb';
import { useVForm } from '../../components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AcompanhamentoService } from '../../api/services/AcompanhamentoService';
import { useEffect, useState } from 'react';
import { SaveToolbar } from '../../components/contents/SaveToolBar';
import { useSnackbar } from '../../contexts/SnackBarProvider';

const formValidationSchema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório').min(3, 'Mínimo 3 caracteres'),
  telefone: yup.string().required('Telefone é obrigatório'),
  email: yup.string().email('Email inválido').optional(),
  endereco: yup.string().optional(),
  dataNascimento: yup.string().optional(),
  interesse: yup.string().optional(),
  nota: yup.string().optional(),
  status: yup.number().optional(),
  usuario: yup.string().optional(),
  idLeads: yup.number().optional(),
});

const initialValues: IAcompanhamentoForm = {
  nome: '',
  telefone: '5562',
  email: '',
  endereco: '',
  dataNascimento: '',
  interesse: '',
  nota: '',
};

const AcompanhamentoRegister: React.FC = () => {
  const { id = false } = useParams();
  const navigate = useNavigate();
  const { showSnackbarMessage } = useSnackbar();
  const { save, ...methods } = useVForm<IAcompanhamentoForm>({
    resolver: yupResolver(formValidationSchema) as any,
    defaultValues: initialValues,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<IAcompanhamentoForm>(initialValues);

  useEffect(() => {
    if (!id) {
      setProject(initialValues);
      return;
    }

    const fetchData = async () => {
      try {
        const resp = await AcompanhamentoService.getById(Number(id));
        setProject(resp);
      } catch (error) {
        showSnackbarMessage((error as Error).message, 'error');
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async (data: IAcompanhamentoForm) => {
    setIsLoading(true);

    try {
      if (!id) {
        await AcompanhamentoService.create(data);
        showSnackbarMessage('Cadastrado com sucesso');
        navigate('/acompanhamento');
      } else {
        await AcompanhamentoService.update(Number(id), data);
        showSnackbarMessage('Atualizado com sucesso');
      }
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;

    try {
      await AcompanhamentoService.deleteById(Number(id));
      showSnackbarMessage('Excluído com sucesso');
      navigate('/acompanhamento');
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    }
  };

  return (
    <PageContainer
      toolbar={
        <SaveToolbar
          showMenuButton
          showNewButton={!!id}
          showSaveButton={!isLoading}
          showDeleteButton={!!id}
          onClickSave={() => save(handleSave)}
          onClickNew={() => navigate('/acompanhamento/cadastrar')}
          onClickBack={() => navigate('/acompanhamento')}
          onClickDelete={handleDelete}
        />
      }
    >
      <AcompanhamentoForm handleSave={handleSave} methods={methods} project={project} isLoading={isLoading} />
    </PageContainer>
  );
};

export default AcompanhamentoRegister;
