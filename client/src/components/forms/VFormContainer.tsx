import { Grid, LinearProgress, Paper } from "@mui/material";
import { VForm  } from "../forms";

interface Props {
  handleSave: (data: any) => void;
  methods: any;
  isLoading?: boolean;
  children: React.ReactNode;
  sx?: any;
}

export const VFormContainer = ({ handleSave, isLoading = false, methods, children, sx = {} }: Props) => {

  return (
    <VForm methods={methods} onSubmit={handleSave}>
      <Paper
        variant="outlined"
        sx={{
          marginX: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          ...sx
        }}
      >
        <Grid container padding={2} spacing={2}>
          {isLoading && (
            <Grid item>
              <LinearProgress variant="indeterminate" />
            </Grid>
          )}
       {children}
        </Grid>
      </Paper>
    </VForm>
  );
};