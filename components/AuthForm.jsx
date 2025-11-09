// /components/AuthForm.jsx
import React, { useState } from "react";

export default function AuthForm({ mode = "signup", onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const endpoint = mode === "signup" ? "/api/auth/register" : "/api/auth/login";

  async function submit(e) {
    e.preventDefault();
    setErr("");
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mode === "signup" ? { name, email, password } : { email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Error");
      return;
    }
    localStorage.setItem("token", data.token);
    if (onSuccess) onSuccess(data);
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      {mode === "signup" && <input placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} required />}
      <input placeholder="Correo institucional" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
      <input placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
      <button type="submit">{mode === "signup" ? "Registrarse" : "Iniciar sesión"}</button>
      {err && <div style={{ color: "red" }}>{err}</div>}
    </form>
  );
}
