import { useDebounce } from '../../../hooks/UseDebounce';
import { useEffect, useRef, useState } from 'react';
import { LayoutListContainer } from '../layouts/LayoutListContainer';
import { useSnackbar } from '../../../contexts/SnackBarProvider';
import { LeadsFranqueadoraCard } from './LeadsFranqueadoraCard';
import { ILeadsFranqueadora } from '../../../entities/Iecb';
import { LeadsFranqueadoraService } from '../../../api/services/LeadsFranqueadoraService';

interface ILeadsFranqueadoraListContainerProps {
    handleOpenComentarios: (row: ILeadsFranqueadora) => void;
    handleOpenDetalhe: (row: ILeadsFranqueadora) => void;
    searchParams: any;
    title?: string;
    statusColor: string;
}

export const LeadsFranqueadoraListContainer: React.FC<ILeadsFranqueadoraListContainerProps> = ({
    handleOpenComentarios,
    handleOpenDetalhe,
    searchParams,
    title,
    statusColor
}) => {
    const { debounce } = useDebounce();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [rows, setRows] = useState<ILeadsFranqueadora[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { showSnackbarMessage } = useSnackbar();
    const [totalCount, setTotalCount] = useState(0);

    const loadData = (nextPage = 1) => {
        const scrollPos = containerRef.current?.scrollTop ?? 0;

        if (nextPage === 1) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }

        LeadsFranqueadoraService.getPrincipal({ ...searchParams, page: nextPage })
            .then((resp) => {
                setIsLoading(false);
                setIsLoadingMore(false);

                if (resp instanceof Error) {
                    showSnackbarMessage(resp.message, 'error');
                } else {
                    setRows((prev) => nextPage === 1 ? resp.data : [...prev, ...resp.data]);
                    setHasMore(resp.data.length > 0);
                    setPage(nextPage);
                    setTotalCount(resp.totalCount || 0);
                    setTimeout(() => {
                        if (containerRef.current && nextPage > 1) {
                            containerRef.current.scrollTop = scrollPos + 270;
                        }
                    }, 0);
                }
            });
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (hasMore && !isLoading && !isLoadingMore && scrollTop + clientHeight >= scrollHeight - 50) {
            loadData(page + 1);
        }
    };

    useEffect(() => {
        debounce(() => {
            setRows([]);
            setPage(1);
            setHasMore(true);
            loadData(1);
        })
    }, [JSON.stringify(searchParams)]);

    return (
        <LayoutListContainer
            totalCount={totalCount}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            handleScroll={handleScroll}
            containerRef={containerRef}
            title={title}
        >
            {!!rows.length && (
                rows.map((row, index) => (
                    <LeadsFranqueadoraCard
                        handleOpenComentarios={handleOpenComentarios}
                        handleOpenDetalhe={handleOpenDetalhe}
                        key={index}
                        row={row}
                        statusColor={statusColor}
                    />
                ))
            )}
        </LayoutListContainer>
    );
};
