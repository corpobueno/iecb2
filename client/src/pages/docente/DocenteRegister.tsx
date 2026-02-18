import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../../components/containers/PageContainer';
import { DocenteForm } from './DocenteForm';
import { IDocenteForm } from '../../entities/Iecb';
import { useVForm } from '../../components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DocenteService } from '../../api/services/DocenteService';
import { useEffect, useState } from 'react';
import { SaveToolbar } from '../../components/contents/SaveToolBar';
import { useSnackbar } from '../../contexts/SnackBarProvider';

const formValidationSchema = yup.object().shape({
  login: yup.string().required('Login é obrigatório'),
  nome: yup.string().required('Nome é obrigatório'),
  rateio: yup.number().optional(),
  rateioRegular: yup.number().optional(),
  color: yup.string().optional(),
  ativo: yup.number().optional(),
});

const DocenteRegister: React.FC = () => {
  const { id = false } = useParams();
  const navigate = useNavigate();
  const { showSnackbarMessage } = useSnackbar();
  const { save, ...methods } = useVForm<IDocenteForm>({
    resolver: yupResolver(formValidationSchema),
  });
  const [isLoading, setIsLoading] = useState(false);

  const initialValues: IDocenteForm = {
    login: '',
    nome: '',
    rateio: 0,
    rateioRegular: 0,
    color: '#1976d2',
    ativo: 1,
  };
  const [project, setProject] = useState<IDocenteForm>(initialValues);

  useEffect(() => {
    if (!id) {
      setProject(initialValues);
      return;
    }

    const fetchData = async () => {
      try {
        const resp = await DocenteService.getById(Number(id));
        setProject(resp);
        Object.keys(resp).forEach((key) => {
          const value = resp[key as keyof IDocenteForm];
          methods.setValue(key as keyof IDocenteForm, value);
        });
      } catch (error) {
        showSnackbarMessage((error as Error).message, 'error');
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async (data: IDocenteForm) => {
    setIsLoading(true);

    try {
      // Converter ativo de boolean para number
      const payload = {
        ...data,
        ativo: data.ativo ? 1 : 0,
      };

      if (!id) {
        await DocenteService.create(payload);
        showSnackbarMessage('Docente cadastrado com sucesso');
        navigate('/docentes');
      } else {
        await DocenteService.update(Number(id), payload);
        showSnackbarMessage('Docente atualizado com sucesso');
      }
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este docente?')) return;

    try {
      await DocenteService.deleteById(Number(id));
      showSnackbarMessage('Docente excluído com sucesso');
      navigate('/docentes');
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    }
  };

  return (
    <PageContainer
      toolbar={
        <SaveToolbar
          showMenuButton={true}
          showNewButton={!!id}
          showSaveButton={!isLoading}
          showDeleteButton={!!id}
          onClickSave={() => save(handleSave)}
          onClickNew={() => navigate('/docentes/cadastrar')}
          onClickBack={() => navigate('/docentes')}
          onClickDelete={handleDelete}
        />
      }
    >
      <DocenteForm handleSave={handleSave} methods={methods} project={project} isLoading={isLoading} isEditing={!!id} />
    </PageContainer>
  );
};

export default DocenteRegister;
