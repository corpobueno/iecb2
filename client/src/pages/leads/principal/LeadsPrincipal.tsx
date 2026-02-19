import { useMediaQuery, Theme, Modal, Box } from "@mui/material";
import { useState } from "react";
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
        data_inicio: '',
        data_fim: '',
        selecao: '',
        usuario: '',
    }
    const [searchParams, setSearchParams] = useState<any>(initialFilters);
    const statusLeads = getStatusList('leads_iecb');
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const [currentLead, setCurrentLead] = useState<ILeadsPrincipal | null>(null);

    const handleOpenComentarios = (lead: ILeadsPrincipal) => {
    
        setCurrentLead(lead);
        setModalIsOpen(true);
    }

    const handleOpenDetalhe = (lead: ILeadsPrincipal) => {
     
        setCurrentLead(lead);
        setModalIsOpen(true);
    }

    const loadData = async () => {
        setSearchParams({ ...searchParams, att: !searchParams.att });
    }


    const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

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
            {smDown ?
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
                        statusColor={"blue"}
                    />
                </>
                )
                : (
                    <LeadsKanban>
                        {
                            statusLeads.map((status) => (
                                <LeadsPrincipalListContainer
                                    title={status.label}
                                    statusColor={status.color}
                                    key={status.id}
                                    handleOpenComentarios={handleOpenComentarios}
                                    handleOpenDetalhe={handleOpenDetalhe}
                                    searchParams={{ ...searchParams, selecao: status.id }}
                                />
                            ))
                        }
                    </LeadsKanban>
                )}

            <Modal
                open={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    maxHeight: 'calc(100vh - 0px)',
                    overflow: 'auto',
                }}>
                    <MessageTabs
                        leads={'leads_iecb'}
                        lead={currentLead}
                        reloadList={loadData}
                    />
                </Box>
            </Modal>
        </PageContainer>
    );
};

export default LeadsPrincipal;
