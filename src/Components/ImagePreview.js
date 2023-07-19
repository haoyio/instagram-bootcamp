import React from 'react';
import { Card, CardMedia } from '@mui/material';

function ImagePreview({ fileInputFile }) {
  if (fileInputFile === null) return;

  return (
    <Card sx={{ maxWidth: 300 }}>
      <CardMedia
        sx={{ height: "10vh" }}
        image={URL.createObjectURL(fileInputFile)}
        title={fileInputFile.name}
      />
    </Card>
  )
}

export const MemoizedImagePreview = React.memo(ImagePreview);
