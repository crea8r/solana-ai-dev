import express from 'express';

const app = express();
const port = 9999;

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true })); 

app.get('/health', (req, res) => {
  res.send({
    status: 'UP',
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
