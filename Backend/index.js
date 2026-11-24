require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Middleware: valida el token
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token requerido' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Registro
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ error: 'El correo ya está registrado' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hash } });
  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// CRUD de tareas (todas protegidas, solo del usuario autenticado)
app.get('/tasks', auth, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(tasks);
});

app.post('/tasks', auth, async (req, res) => {
  const { title, description } = req.body;
  const task = await prisma.task.create({
    data: { title, description, userId: req.userId },
  });
  res.status(201).json(task);
});

app.put('/tasks/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, completed } = req.body;
  const result = await prisma.task.updateMany({
    where: { id, userId: req.userId },
    data: { title, description, completed },
  });
  if (result.count === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json({ message: 'Tarea actualizada' });
});

app.delete('/tasks/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  const result = await prisma.task.deleteMany({ where: { id, userId: req.userId } });
  if (result.count === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json({ message: 'Tarea eliminada' });
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));