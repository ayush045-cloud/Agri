import app from './app';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.listen(PORT, () => {
  console.log(`🌿 Agro Mind API running on http://localhost:${PORT}`);
});
