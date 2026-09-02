#!/usr/bin/env bash
set -Eeuo pipefail

readonly expected_prefix="deploy ghcr.io/mansoormajidi/timebank@sha256:"
readonly original_command="${SSH_ORIGINAL_COMMAND:-}"

if [[ "$original_command" != "$expected_prefix"* ]]; then
  echo "This key may only deploy an immutable Timebank image." >&2
  exit 1
fi

image="${original_command#deploy }"
if [[ ! "$image" =~ ^ghcr\.io/mansoormajidi/timebank@sha256:[a-f0-9]{64}$ ]]; then
  echo "Invalid image reference." >&2
  exit 1
fi

export IMAGE="$image"
exec /opt/applications/timebank/deploy.sh
