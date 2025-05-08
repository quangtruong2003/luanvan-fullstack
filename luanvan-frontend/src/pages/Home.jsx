import React from 'react';
import { Typography, Card, CardContent, Grid, Paper, Box } from '@mui/material';
import Layout from '../components/Layout';

const Home = () => {
  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chào mừng đến với Luận Văn Tốt Nghiệp
        </Typography>
        <Typography variant="body1" paragraph>
          Đây là trang chủ của ứng dụng. Bạn có thể thêm nội dung giới thiệu về luận văn của mình ở đây.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phần 1: Giới thiệu
              </Typography>
              <Typography variant="body2">
                Mô tả tổng quan về đề tài luận văn, phạm vi nghiên cứu và các mục tiêu cần đạt được.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phần 2: Phương pháp nghiên cứu
              </Typography>
              <Typography variant="body2">
                Trình bày các phương pháp nghiên cứu, công nghệ sử dụng và cách tiếp cận vấn đề.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phần 3: Kết quả
              </Typography>
              <Typography variant="body2">
                Trình bày các kết quả đạt được, phân tích dữ liệu và đánh giá hiệu quả của giải pháp.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Home;