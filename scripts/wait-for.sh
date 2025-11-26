#!/usr/bin/env bash
set -e
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 host:port -- command args..."
  exit 1
fi
hostport="$1"
shift
if [ "$1" = "--" ]; then
  shift
fi
host=${hostport%%:*}
port=${hostport##*:}

echo "Waiting for $host:$port..."
while ! bash -c "</dev/tcp/${host}/${port}" >/dev/null 2>&1; do
  sleep 1
done

echo "$host:$port is reachable — executing command: $*"
exec "$@"
