import { useEffect, useState } from 'react';
import { request } from './api';

export default function Tasks({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [error, setError] = useState('');

  // Si el token es inválido o expiró, se cierra la sesión
  function manejarError(err) {
    if (err.status === 401) onLogout();
    else setError(err.message);
  }

  async function cargarTareas() {
    try {
      const data = await request('/tasks');
      setTasks(data);
    } catch (err) {
      manejarError(err);
    }
  }

  useEffect(() => {
    cargarTareas();
  }, []);

  async function crearTarea(e) {
    e.preventDefault();
    setError('');
    try {
      await request('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, description }),
      });
      setTitle('');
      setDescription('');
      cargarTareas();
    } catch (err) {
      manejarError(err);
    }
  }

  async function eliminarTarea(id) {
    try {
      await request(`/tasks/${id}`, { method: 'DELETE' });
      cargarTareas();
    } catch (err) {
      manejarError(err);
    }
  }

  async function cambiarEstado(task) {
    try {
      await request(`/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: !task.completed }),
      });
      cargarTareas();
    } catch (err) {
      manejarError(err);
    }
  }

  function empezarEdicion(task) {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  }

  async function guardarEdicion(id) {
    try {
      await request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      setEditId(null);
      cargarTareas();
    } catch (err) {
      manejarError(err);
    }
  }

  return (
    <div className="card tasks">
      <header>
        <h1>Mis tareas</h1>
        <button className="secondary" onClick={onLogout}>Cerrar sesión</button>
      </header>

      <form onSubmit={crearTarea}>
        <input
          placeholder="Título de la tarea"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Agregar tarea</button>
      </form>

      {error && <p className="error">{error}</p>}

      {tasks.length === 0 && <p className="vacio">Aún no tienes tareas.</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'hecha' : ''}>
            {editId === task.id ? (
              <div className="editando">
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <button onClick={() => guardarEdicion(task.id)}>Guardar</button>
                <button className="secondary" onClick={() => setEditId(null)}>
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => cambiarEstado(task)}
                />
                <div className="texto">
                  <strong>{task.title}</strong>
                  {task.description && <span>{task.description}</span>}
                </div>
                <button className="secondary" onClick={() => empezarEdicion(task)}>
                  Editar
                </button>
                <button className="peligro" onClick={() => eliminarTarea(task.id)}>
                  Eliminar
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}