import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import fileRoutes from './routes/fileRoutes';
import orgRoutes from './routes/orgRoutes';
import taskRoutes from './routes/taskRoutes';
import aiRoutes from './routes/aiRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9999;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/files', fileRoutes);
app.use('/org', orgRoutes);
app.use('/tasks', taskRoutes);
app.use('/ai', aiRoutes);

app.use('/health', (req, res) => {
  return res.status(200).json({
    message: 'Server is running',
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
