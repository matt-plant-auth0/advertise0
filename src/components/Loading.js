import React from "react";
import loading from "../assets/loading.svg";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const Loading = () => (
  <div className="spinner">
    <Box sx={{ display: 'flex' , height: 200, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <CircularProgress />
    </Box>
  </div>
);

export default Loading;
