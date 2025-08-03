import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import faucetRoutes from './routes/faucet';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    network: process.env.SUI_NETWORK || 'testnet'
  });
});

// API routes
app.use('/api/faucet', faucetRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize Sui service
    console.log('🔄 Initializing Sui service...');
    const { suiService } = await import('./services/suiService');
    await suiService.initializeFaucetWallet();
    console.log('✅ Sui service initialized successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Sui Faucet Backend running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Network: ${process.env.SUI_NETWORK || 'testnet'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🎯 Faucet API: http://localhost:${PORT}/api/faucet/status`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
