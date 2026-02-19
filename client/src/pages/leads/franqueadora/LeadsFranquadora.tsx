import { useMediaQuery, Theme, Modal, Box } from "@mui/material";
import { useState } from "react";
import { ToggleButtonStatus } from "../layouts/ToggleButtonStatus";
import { LeadsKanban } from "../layouts/LeadsKanban";
import { MessageTabsFranqueadora } from "../components/MessageTabsFranqueadora";
import { LeadsFiltros } from "../components/LeadsFiltros";
import { getStatusList } from "../status";
import { LeadsFranqueadoraListContainer } from "./LeadsFranqueadoraListContainer";
import { PageContainer } from "../../../components/containers/PageContainer";
import { SearchToolbar } from "../../../components/contents/SearchToolbar";
import { ILeadsFranqueadora } from "../../../entities/Iecb";

const LeadsFranqueadora: React.FC = () => {

    const initialFilters = {
        page: 1,
        filter: '',
        data_inicio: '',
        data_fim: '',
        status: '',
        user: '',
    }
    const [searchParams, setSearchParams] = useState<any>(initialFilters);
    const statusLeads = getStatusList('leads_franquiados');
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const [currentLead, setCurrentLead] = useState<ILeadsFranqueadora | null>(null);

    const handleOpenComentarios = (lead: ILeadsFranqueadora) => {
        setCurrentLead(lead);
        setModalIsOpen(true);
    }

    const handleOpenDetalhe = (lead: ILeadsFranqueadora) => {
        setCurrentLead(lead);
        setModalIsOpen(true);
    }

    const loadData = async () => {
        setSearchParams({ ...searchParams, att: !searchParams.att });
    }

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

                    <LeadsFranqueadoraListContainer
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
                                <LeadsFranqueadoraListContainer
                                    title={status.label}
                                    statusColor={status.color}
                                    key={status.id}
                                    handleOpenComentarios={handleOpenComentarios}
                                    handleOpenDetalhe={handleOpenDetalhe}
                                    searchParams={{ ...searchParams, status: status.id }}
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
                    <MessageTabsFranqueadora
                        leads={'leads_franquiados'}
                        lead={currentLead}
                        reloadList={loadData}
                    />
                </Box>
            </Modal>
        </PageContainer>
    );
};

export default LeadsFranqueadora;
