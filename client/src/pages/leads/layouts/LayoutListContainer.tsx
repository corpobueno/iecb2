import { Box, Container, Skeleton, Typography } from "@mui/material";
import { scrollStyle, getSafeAreaStyles } from "../../../utils/styles";

const LeadsCardSkeleton: React.FC = () => (
    <Box sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper'
    }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="rectangular" width={60} height={18} />
        </Box>

        <Skeleton variant="text" width="40%" height={20} />
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Skeleton variant="rectangular" width={80} height={18} />
            <Skeleton variant="rectangular" width={80} height={18} />
        </Box>
    </Box>
);
    const renderSkeletons = () => (
        Array.from({ length: 6 }).map((_, index) => (
            <LeadsCardSkeleton key={`skeleton-${index}`} />
        ))
    );

export const LayoutListContainer = ({
    children,
    isLoading,
    isLoadingMore,
    handleScroll,
    containerRef,
    title,
    totalCount
}: any) => {
    // Define o offset baseado na presença do título
    const offset = title ? '140px' : '180px';

    return (
        <Container
            ref={containerRef}
            onScroll={handleScroll}
            sx={{
                ...scrollStyle,
                ...getSafeAreaStyles(offset, { includeOverflow: false }),
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 360,
                gap: 1,
                position: 'relative',
            }}
        >
            {title && (
                <Box sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 5,
                    width: '100%',
                    bgcolor: 'background.default',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="h6" color='textSecondary' >{totalCount}</Typography>
                </Box>
            )}

            {isLoading ? (
                // Mostra skeletons durante carregamento inicial
                renderSkeletons()
            ) : 
            children
            }

            {/* Skeleton para carregamento de mais itens */}
            {isLoadingMore && (
                <Box sx={{ mt: 1 }}>
                    <LeadsCardSkeleton />
                    <Box sx={{ mt: 1 }}>
                        <LeadsCardSkeleton />
                    </Box>
                </Box>
            )}
        </Container>
    );
}