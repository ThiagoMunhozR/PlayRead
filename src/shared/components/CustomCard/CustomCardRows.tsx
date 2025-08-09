import { Box, Grid, Skeleton, IconButton, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CustomCard } from '../CustomCard/CustomCard';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface CustomCardRowsProps {
    items: Array<{
        id: string | number;
        imageSrc: string;
        title: string;
        subtitle?: string;
        rating?: number;
        showTrophy?: boolean;
    }>;
    isMobile: boolean;
    onDeleted?: () => void;
    loading?: boolean;
    onSeeMore: () => void;
    title: string;
    defaultExpanded?: boolean;
}

export const CustomCardRows: React.FC<CustomCardRowsProps> = ({
    items,
    isMobile,
    onDeleted,
    loading = false,
    onSeeMore,
    title,
    defaultExpanded = false,
}) => {
    return (
        <Accordion defaultExpanded={defaultExpanded} sx={{ width: '100%', marginTop: 2, bgcolor: 'transparent', boxShadow: 'none', border: 'none', borderRadius: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ margin: '0 0 0 8px' }}>{title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box sx={{ overflowX: 'auto', width: '100%' }}>
                    <Grid
                        container
                        spacing={isMobile ? 1 : 2}
                        wrap="nowrap"
                        sx={{ flexWrap: 'nowrap !important', minWidth: '100%' }}
                    >
                        {loading
                            ? Array.from({ length: 6 }).map((_, idx) => (
                                <Grid
                                    item
                                    key={idx}
                                    xs={6}
                                    sm={4}
                                    md={3}
                                    lg={2.4}
                                    xl={2.4}
                                    sx={{ minWidth: isMobile ? 140 : 200, flex: '0 0 auto' }}
                                >
                                    <Skeleton
                                        variant="rectangular"
                                        width="100%"
                                        height={isMobile ? 240 : 355}
                                        sx={{ borderRadius: 2 }}
                                    />
                                </Grid>
                            ))
                            : <>
                                {items.map((item) => (
                                    <Grid
                                        item
                                        key={item.id}
                                        xs={6}
                                        sm={4}
                                        md={3}
                                        lg={2.4}
                                        xl={2.4}
                                        sx={{ minWidth: isMobile ? 140 : 200, flex: '0 0 auto' }}
                                    >
                                        <CustomCard
                                            isMobile={isMobile}
                                            imageSrc={item.imageSrc}
                                            title={item.title}
                                            subtitle={item.subtitle}
                                            rating={item.rating}
                                            showTrophy={item.showTrophy}
                                            // idEditing={typeof item.id === 'number' ? item.id : undefined}
                                            onDeleted={onDeleted}
                                        />
                                    </Grid>
                                ))}
                                {/* Botão Ver mais */}
                                <Grid
                                    item
                                    key="see-more"
                                    xs={6}
                                    sm={4}
                                    md={3}
                                    lg={2.4}
                                    xl={2.4}
                                    sx={{ minWidth: isMobile ? 140 : 200, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
                                >
                                    <IconButton
                                        color="primary"
                                        onClick={onSeeMore}
                                        sx={{
                                            width: isMobile ? 56 : 72,
                                            height: isMobile ? 56 : 72,
                                            mb: 1,
                                            '&:hover': {
                                                backgroundColor: 'primary.50',
                                            },
                                        }}
                                    >
                                        <AddCircleOutlineIcon sx={{ fontSize: isMobile ? 32 : 40 }} />
                                    </IconButton>
                                    <Typography variant={isMobile ? 'body2' : 'body1'} align="center" color="primary">
                                        Ver mais
                                    </Typography>
                                </Grid>
                            </>}
                    </Grid>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};