import { useEffect, useState } from 'react';
import { LeadsFranqueadoraService } from '../../../api/services/LeadsFranqueadoraService';
import { ILeadsFranqueadora, ILeadsFranqueadoraComentario, ILeadsFranqueadoraComentarioForm } from '../../../entities/Iecb';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ComentariosContainer } from '../layouts/ComentariosContainer';
import { ComentarioItem } from '../layouts/ComentarioItem';
import { ComentariosInput } from './ComentariosInput';
import { getStatusList } from '../status';

interface IComentariosProps {
    leads: string;
    lead: ILeadsFranqueadora | null;
    reloadList: () => void;
}

export const ComentariosLeadsFranqueadora: React.FC<IComentariosProps> = ({
    leads,
    lead,
    reloadList,
}) => {
    const initialProject: Partial<ILeadsFranqueadoraComentarioForm> = {
        idLeads: lead?.id ?? 0,
        telefone: lead?.telefone || '',
        tabela: leads,
        nota: '',
        status: '',
    }
    const selectOptions = getStatusList(leads);
    const [isLoading, setIsLoading] = useState(true);
    const [comentarios, setComentarios] = useState<ILeadsFranqueadoraComentario[]>([]);
    const [project, setProject] = useState<Partial<ILeadsFranqueadoraComentarioForm>>(initialProject);

    useEffect(() => {
        loadData();
    }, [lead]);

    const loadData = () => {
        if (!lead) return;
        setIsLoading(true);
        LeadsFranqueadoraService.getComentarios(lead.telefone)
            .then(result => {
                if (result instanceof Error) {
                    alert(result.message);
                } else {
                    setComentarios(result);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const save = () => {
        if (!lead) return;

        LeadsFranqueadoraService.createComentario({
            ...project,
            idLeads: lead.id,
            telefone: lead.telefone,
            tabela: leads,
        })
            .then(result => {
                if (result instanceof Error) {
                    alert(result.message);
                } else {
                    loadData();
                    setProject(initialProject);
                    reloadList();
                }
            })
    }

    const handleSend = () => {
        if (project.nota?.trim() && project.status) {
            save();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Map 'texto' to 'nota' for compatibility with ComentariosInput
        const fieldName = name === 'texto' ? 'nota' : name;
        setProject({ ...project, [fieldName]: value })
    };

    return (
        <>
            <ComentariosContainer
                isLoading={isLoading}
                showEmpty={comentarios.length === 0}
                emptyMessage="Nenhum comentário encontrado"
            >
                {comentarios.map((comentario) => (
                    <ComentarioItem
                        key={comentario.id}
                        content={comentario.nota}
                        sender={comentario.user || ''}
                        timestamp={format(new Date(comentario.data), "HH:mm - dd/MM/yyyy", { locale: ptBR })}
                        status={comentario.status}
                        leadsType={comentario.tabela || leads}
                    />
                ))}
            </ComentariosContainer>

            <ComentariosInput
                messageText={project.nota || ''}
                onSend={handleSend}
                selectValue={project.status}
                handleChange={handleChange}
                selectOptions={selectOptions}
                disabled={isLoading}
            />
        </>
    );
};
