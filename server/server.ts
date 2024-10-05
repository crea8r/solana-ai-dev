import express from 'express';

const app = express();
const port = 9999;

app.get('/health', (req, res) => {
  res.send({
    status: 'UP',
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
