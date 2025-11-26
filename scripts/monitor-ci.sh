#!/usr/bin/env bash
# Monitor de CI para GitHub Actions (uso local)
# Requiere: `jq` y la variable de entorno `GITHUB_TOKEN` con permisos `repo` o `repo:status`/`workflow`.

set -euo pipefail

REPO_OWNER="Kazooth"
REPO_NAME="Sistema-Base-de-Datos-Parqueadero-"
BRANCH="feature/ci-troubleshooting"
TOKEN="${GITHUB_TOKEN:-}"

if [ -z "$TOKEN" ]; then
  echo "ERROR: configura la variable de entorno GITHUB_TOKEN con un token válido."
  echo "Ej: export GITHUB_TOKEN=ghp_..."
  exit 1
fi

API_URL="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs"

echo "Monitorizando workflows para $REPO_OWNER/$REPO_NAME (branch: $BRANCH)"

while true; do
  resp=$(curl -s -H "Authorization: token $TOKEN" "$API_URL?branch=$BRANCH&per_page=1")
  run_id=$(echo "$resp" | jq -r '.workflow_runs[0].id // "null"')
  status=$(echo "$resp" | jq -r '.workflow_runs[0].status // "unknown"')
  conclusion=$(echo "$resp" | jq -r '.workflow_runs[0].conclusion // "null"')

  if [ "$run_id" = "null" ]; then
    echo "No se encontraron ejecuciones para la rama '$BRANCH'. Saliendo."
    exit 2
  fi

  echo "Run ID: $run_id — status: $status — conclusion: $conclusion"

  if [ "$status" = "completed" ]; then
    echo "Ejecución finalizada: $conclusion"
    # Obtener URL del run
    html_url=$(echo "$resp" | jq -r '.workflow_runs[0].html_url')
    echo "Detalle: $html_url"
    # Si deseas descargar logs: uncomment siguiente línea
    # curl -L -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs/$run_id/logs" -o "workflow-$run_id-logs.zip"
    exit 0
  fi

  # Esperar un poco antes de reintentar
  sleep 15
done
