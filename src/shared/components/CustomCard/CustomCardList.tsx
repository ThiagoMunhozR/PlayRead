import { Box, Grid, Pagination, LinearProgress } from '@mui/material';
import { CustomCard } from '../CustomCard/CustomCard';

interface CustomCardListProps {
  items: Array<{
    id: string | number;
    imageSrc: string;
    title: string;
    subtitle?: string;
    rating?: number;
    showTrophy?: boolean;
  }>;
  isMobile: boolean;
  showPagination?: boolean;
  page?: number;
  totalCount?: number;
  limitPerPage?: number;
  onPageChange?: (newPage: number) => void;
  isLoading?: boolean;
}

export const CustomCardList: React.FC<CustomCardListProps> = ({
  items,
  isMobile,
  showPagination = false,
  page = 1,
  totalCount = 0,
  limitPerPage = 25,
  onPageChange,
  isLoading = false,
}) => {
  return (
    <>
      {isLoading && (
        <Box
          sx={{
            width: '90%',
            margin: '0 auto',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <LinearProgress variant="indeterminate" />
        </Box>
      )}
      <Grid
        container
        spacing={isMobile ? 1 : 2}
        margin={0}
        sx={{
          width: '100%',
          marginRight: 0,
          marginLeft: 0,
          paddingRight: 0,
          paddingLeft: 0,
          overflowX: 'hidden',
        }}
      >
        {items.map((item) => (
          <Grid
            item
            key={item.id}
            xs={6}
            sm={4}
            md={4}
            lg={2.4}
            xl={2.4}
          >
            <CustomCard
              isMobile={isMobile}
              imageSrc={item.imageSrc}
              title={item.title}
              subtitle={item.subtitle}
              rating={item.rating}
              showTrophy={item.showTrophy}
              idEditing={typeof item.id === 'number' ? item.id : undefined}
            />
          </Grid>
        ))}
      </Grid>
      {showPagination && totalCount > 0 && totalCount > limitPerPage && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 2,
            marginBottom: 2,
          }}
        >
          <Pagination
            page={page}
            count={Math.ceil(totalCount / limitPerPage)}
            onChange={(_, newPage) => {
              onPageChange?.(newPage);
            }}
          />
        </Box>
      )}
    </>
  );
};
