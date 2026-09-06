import express from 'express';
import cookieParser from 'cookie-parser';
import * as path from 'path';

import couponRoutes from './routes/coupon.routes';
import { setupSwagger } from './swagger';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

setupSwagger(app);

app.use('/api/coupons', couponRoutes);

app.get('/coupon-health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Coupon Service',
    message: 'Coupon Service is running successfully',
  });
});

const port = process.env.PORT || 6004;

const server = app.listen(port, () => {
  console.log('======================================');
  console.log(`🚀 Coupon Service running on port ${port}`);
  console.log(`📚 Swagger Docs: http://localhost:${port}/api-docs`);
  console.log(`❤️ Health Check: http://localhost:${port}/coupon-health`);
  console.log('======================================');
});

server.on('error', console.error);