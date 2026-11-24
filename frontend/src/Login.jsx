import { useState } from 'react';
import { request } from './api';

export default function Login({ onLogin }) {
  const [modoRegistro, setModoRegistro] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      if (modoRegistro) {
        await request('/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
        setMensaje('Cuenta creada. Ahora inicia sesión.');
        setModoRegistro(false);
        setPassword('');
      } else {
        const data = await request('/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        onLogin(data.token);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card login">
      <h1>{modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h1>

      <form onSubmit={handleSubmit}>
        {modoRegistro && (
          <input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{modoRegistro ? 'Registrarme' : 'Entrar'}</button>
      </form>

      {error && <p className="error">{error}</p>}
      {mensaje && <p className="ok">{mensaje}</p>}

      <button className="link" onClick={() => setModoRegistro(!modoRegistro)}>
        {modoRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
      </button>
    </div>
  );
}