import { useEffect, useState } from 'react';
import { LeadsService } from '../../../api/services/LeadsService';
import { ILeads, ILeadsComentarioForm, ILeadsPrincipal } from '../../../entities/Iecb';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ComentariosContainer } from '../layouts/ComentariosContainer';
import { ComentarioItem } from '../layouts/ComentarioItem';
import { ComentariosInput } from './ComentariosInput';
import { getStatusList } from '../status';

interface IComentariosProps {
    leads: string;
    lead: ILeadsPrincipal | null;
    reloadList: () => void;
}

export const ComentariosLeads: React.FC<IComentariosProps> = ({
    leads,
    lead,
    reloadList,
}) => {
    const initialProject: Partial<ILeadsComentarioForm> = {
        idLead: lead?.id ?? 0,
        telefone: lead?.telefone || '',
        texto: '',
        status: '',
    }
    const selectOptions = getStatusList(leads);
    const [isLoading, setIsLoading] = useState(true);
    const [comentarios, setComentarios] = useState<ILeads[]>([]);
    const [project, setProject] = useState<Partial<ILeadsComentarioForm>>(initialProject);

    useEffect(() => {
        loadData();
    }, [lead]);

    const loadData = () => {
        if (!lead) return;
        setIsLoading(true);
        LeadsService.getComentarios(lead.telefone)
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

        LeadsService.createComentario({
            ...project,
            idLead: lead.id,
            telefone: lead.telefone,
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
        if (project.texto?.trim() && project.status) {
            save();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProject({ ...project, [name]: value })
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
                        content={comentario.texto}
                        sender={comentario.usuario || ''}
                        timestamp={format(new Date(comentario.data), "HH:mm - dd/MM/yyyy", { locale: ptBR })}
                        status={comentario.status}
                        leadsType={comentario.leads || leads}
                    />
                ))}
            </ComentariosContainer>

            <ComentariosInput
                messageText={project.texto || ''}
                onSend={handleSend}
                selectValue={project.status}
                handleChange={handleChange}
                selectOptions={selectOptions}
                disabled={isLoading}
            />
        </>
    );
};
