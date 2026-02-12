import { useMediaQuery, Theme, Dialog } from "@mui/material";
import { useState } from "react";
import dayjs from "dayjs";
import { ToggleButtonStatus } from "../layouts/ToggleButtonStatus";
import { LeadsKanban } from "../layouts/LeadsKanban";
import { MessageTabs } from "../components/MessageTabs";
import { LeadsFiltros } from "../components/LeadsFiltros";
import { getStatusList } from "../status";
import { LeadsPrincipalListContainer } from "./LeadsPrincipalListContainer";
import { PageContainer } from "../../../components/containers/PageContainer";
import { SearchToolbar } from "../../../components/contents/SearchToolbar";
import { ILeadsPrincipal } from "../../../entities/Iecb";

const LeadsPrincipal: React.FC = () => {

    const initialFilters = {
        page: 1,
        filter: '',
        data_inicio: dayjs().startOf('month').format('YYYY-MM-DD'),
        data_fim: dayjs().endOf('month').format('YYYY-MM-DD'),
        selecao: '',
        usuario: '',
    }
    const [searchParams, setSearchParams] = useState<any>(initialFilters);
    const statusLeads = getStatusList('leads_iecb');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentModal, setCurrentModal] = useState<number>(0);
    const [currentLead, setCurrentLead] = useState<ILeadsPrincipal | null>(null);

    const handleOpenComentarios = (lead: ILeadsPrincipal) => {
        setCurrentModal(0)
        setCurrentLead(lead);
        setModalIsOpen(true);
    }

    const handleOpenDetalhe = (lead: ILeadsPrincipal) => {
        setCurrentModal(1)
        setCurrentLead(lead);
        setModalIsOpen(true);
    }

    const loadData = async () => {
        setSearchParams({ ...searchParams, att: !searchParams.att });
    }


    const modals = [
        <MessageTabs
            leads={'leads_iecb'}
            lead={currentLead}
            reloadList={loadData}
        />
    ]

    const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

    return (
            <PageContainer
                toolbar={
                    <SearchToolbar
                        showMenuButton={false}
                        showInputSearch={false}
                        showBackButton={false}
                    >
                        <LeadsFiltros
                            initialFilters={initialFilters}
                            onFilterChange={setSearchParams}
                        />
                    </SearchToolbar>
                }
            >
                {mdDown ?
                    (<>
                        <ToggleButtonStatus
                            statusLeads={statusLeads}
                            searchParams={searchParams}
                            setSearchParams={setSearchParams}
                        />

                        <LeadsPrincipalListContainer
                            handleOpenComentarios={handleOpenComentarios}
                            handleOpenDetalhe={handleOpenDetalhe}
                            searchParams={searchParams}
                        />
                    </>
                    )
                    : (
                        <LeadsKanban>
                            {
                                statusLeads.map((status) => (
                                    <LeadsPrincipalListContainer
                                        title={status.label}
                                        key={status.id}
                                        handleOpenComentarios={handleOpenComentarios}
                                        handleOpenDetalhe={handleOpenDetalhe}
                                        searchParams={{ ...searchParams, selecao: status.id }}
                                    />
                                ))
                            }
                        </LeadsKanban>
                    )}

                <Dialog open={modalIsOpen} onClose={()=> setModalIsOpen(false)}>
                    {modals[currentModal]}
                </Dialog>
            </PageContainer>
    );
};

export default LeadsPrincipal;
