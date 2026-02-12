import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../../components/containers/PageContainer';
import { CursoForm } from './CursoForm';
import { ICursoForm } from '../../entities/Iecb';
import { useVForm } from '../../components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CursoService } from '../../api/services/CursoService';
import { useEffect, useState } from 'react';
import { SaveToolbar } from '../../components/contents/SaveToolBar';
import { useSnackbar } from '../../contexts/SnackBarProvider';

const formValidationSchema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório'),
  categoria: yup.string().optional(),
  valor: yup.number().optional(),
  duracao: yup.string().optional(),
  qnt: yup.number().optional(),
  color: yup.string().optional(),
  vip: yup.number().optional(),
  grupo: yup.number().optional(),
  rateioModelo: yup.number().optional(),
});

const CursoRegister: React.FC = () => {
  const { id = false } = useParams();
  const navigate = useNavigate();
  const { showSnackbarMessage } = useSnackbar();
  const { save, ...methods } = useVForm<ICursoForm>({
    resolver: yupResolver(formValidationSchema),
  });
  const [isLoading, setIsLoading] = useState(false);

  const initialValues: ICursoForm = {
    nome: '',
    categoria: '',
    valor: 0,
    duracao: '',
    qnt: 1,
    color: '#1976d2',
    vip: 0,
    grupo: 0,
    rateioModelo: 0,
  };
  const [project, setProject] = useState<ICursoForm>(initialValues);

  useEffect(() => {
    if (!id) {
      setProject(initialValues);
      return;
    }

    const fetchData = async () => {
      try {
        const resp = await CursoService.getById(Number(id));
        setProject(resp);
        Object.keys(resp).forEach((key) => {
          methods.setValue(key as keyof ICursoForm, resp[key as keyof ICursoForm]);
        });
      } catch (error) {
        showSnackbarMessage((error as Error).message, 'error');
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async (data: ICursoForm) => {
    setIsLoading(true);

    try {
      if (!id) {
        await CursoService.create(data);
        showSnackbarMessage('Curso cadastrado com sucesso');
        navigate('/cursos');
      } else {
        await CursoService.update(Number(id), data);
        showSnackbarMessage('Curso atualizado com sucesso');
      }
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este curso?')) return;

    try {
      await CursoService.deleteById(Number(id));
      showSnackbarMessage('Curso excluído com sucesso');
      navigate('/cursos');
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
          onClickNew={() => navigate('/cursos/cadastrar')}
          onClickBack={() => navigate('/cursos')}
          onClickDelete={handleDelete}
        />
      }
    >
      <CursoForm handleSave={handleSave} methods={methods} project={project} isLoading={isLoading} />
    </PageContainer>
  );
};

export default CursoRegister;
