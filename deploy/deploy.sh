#!/usr/bin/env bash
set -Eeuo pipefail

readonly APP_DIR="${APP_DIR:-/opt/applications/timebank}"
readonly COMPOSE_FILE="$APP_DIR/compose.production.yml"
readonly ACTIVE_SLOT_FILE="$APP_DIR/.active-slot"
readonly NGINX_CONTAINER="${NGINX_CONTAINER:-dong-nginx-1}"
readonly PROXY_NETWORK="${PROXY_NETWORK:-dong_frontend}"
readonly NGINX_UPSTREAM_FILE="${NGINX_UPSTREAM_FILE:-/opt/applications/dong/nginx/conf.d/timebank-upstream.inc}"
readonly PUBLIC_HEALTH_URL="${PUBLIC_HEALTH_URL:-https://timebank.iranihosts.com/api/health}"
readonly HEALTH_ATTEMPTS="${HEALTH_ATTEMPTS:-30}"

: "${IMAGE:?IMAGE must contain the immutable GHCR image digest}"

if [[ ! "$IMAGE" =~ ^ghcr\.io/mansoormajidi/timebank@sha256:[a-f0-9]{64}$ ]]; then
  echo "IMAGE must be an immutable timebank GHCR digest." >&2
  exit 1
fi

docker network inspect "$PROXY_NETWORK" >/dev/null

if ! docker inspect "$NGINX_CONTAINER" --format '{{json .NetworkSettings.Networks}}' | grep -q "\"$PROXY_NETWORK\""; then
  echo "Nginx is not connected to the expected proxy network." >&2
  exit 1
fi

active_slot=""
if [[ -f "$ACTIVE_SLOT_FILE" ]]; then
  active_slot="$(tr -d '[:space:]' < "$ACTIVE_SLOT_FILE")"
fi

if [[ "$active_slot" == "blue" ]]; then
  new_slot="green"
else
  new_slot="blue"
fi

export IMAGE PROXY_NETWORK
export SLOT="$new_slot"

docker compose --project-name "timebank-$new_slot" --file "$COMPOSE_FILE" pull
docker compose --project-name "timebank-$new_slot" --file "$COMPOSE_FILE" up --detach --force-recreate

new_container="timebank-$new_slot"
healthy=false
for ((attempt = 1; attempt <= HEALTH_ATTEMPTS; attempt++)); do
  status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$new_container" 2>/dev/null || true)"
  if [[ "$status" == "healthy" ]]; then
    healthy=true
    break
  fi
  if [[ "$status" == "unhealthy" || "$status" == "exited" || "$status" == "dead" ]]; then
    break
  fi
  sleep 2
done

if [[ "$healthy" != "true" ]]; then
  docker logs --tail 100 "$new_container" || true
  docker compose --project-name "timebank-$new_slot" --file "$COMPOSE_FILE" down
  echo "New container did not become healthy; active slot was not changed." >&2
  exit 1
fi

previous_upstream=""
if [[ -f "$NGINX_UPSTREAM_FILE" ]]; then
  previous_upstream="$(<"$NGINX_UPSTREAM_FILE")"
fi
printf 'set $timebank_upstream timebank-%s:3000;\n' "$new_slot" > "$NGINX_UPSTREAM_FILE"

rollback() {
  if [[ -n "$previous_upstream" ]]; then
    printf '%s\n' "$previous_upstream" > "$NGINX_UPSTREAM_FILE"
    docker exec "$NGINX_CONTAINER" nginx -t >/dev/null 2>&1 || true
    docker exec "$NGINX_CONTAINER" nginx -s reload >/dev/null 2>&1 || true
  fi
  export SLOT="$new_slot"
  docker compose --project-name "timebank-$new_slot" --file "$COMPOSE_FILE" down || true
}

if ! docker exec "$NGINX_CONTAINER" nginx -t; then
  rollback
  echo "Nginx validation failed; deployment was rolled back." >&2
  exit 1
fi

docker exec "$NGINX_CONTAINER" nginx -s reload

public_healthy=false
for ((attempt = 1; attempt <= 10; attempt++)); do
  if curl --fail --silent --show-error --max-time 5 "$PUBLIC_HEALTH_URL" >/dev/null; then
    public_healthy=true
    break
  fi
  sleep 2
done

if [[ "$public_healthy" != "true" ]]; then
  rollback
  echo "Public health check failed; Nginx was switched back." >&2
  exit 1
fi

printf '%s\n' "$new_slot" > "$ACTIVE_SLOT_FILE"

if [[ "$active_slot" == "blue" || "$active_slot" == "green" ]]; then
  old_image="$(docker inspect --format '{{.Config.Image}}' "timebank-$active_slot" 2>/dev/null || true)"
  export SLOT="$active_slot"
  docker compose --project-name "timebank-$active_slot" --file "$COMPOSE_FILE" down
  if [[ -n "$old_image" && "$old_image" != "$IMAGE" ]]; then
    docker image rm "$old_image" >/dev/null 2>&1 || true
  fi
fi

echo "Deployment completed on slot $new_slot with image $IMAGE"
