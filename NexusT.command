#!/bin/bash
set -e

PROJECT="/Users/fmassey/Git/terpel-nexus-t"
URL="http://localhost:3000"

cd "$PROJECT" || exit 1

echo "Iniciando server..."
npm run dev &
DEV_PID=$!

cleanup() {
  echo ""
  echo "Cerrando... apagando server (PID $DEV_PID)"
  # Mata el grupo de procesos (server + hijos)
  kill -TERM -- -"$DEV_PID" 2>/dev/null || true
  # Por si algo queda vivo, fuerza después de un momento
  sleep 1
  kill -KILL -- -"$DEV_PID" 2>/dev/null || true
}

# Ejecuta cleanup al cerrar la ventana, Ctrl+C, o terminar el script
trap cleanup EXIT INT TERM HUP

# Espera hasta 60s a que la URL responda
for i in {1..60}; do
  if curl -fsS "$URL" >/dev/null 2>&1; then
    echo "Abriendo $URL"
    open "$URL"
    break
  fi
  sleep 1
done

# Mantiene el script “pegado” al proceso del dev server
wait $DEV_PID
