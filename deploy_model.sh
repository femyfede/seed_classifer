#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

for artifact in \
  model/seed_classifier.onnx \
  model/seed_classifier.onnx.data \
  model/classes.json \
  model/model_meta.json
do
  if [[ ! -s "$artifact" ]]; then
    echo "Required model artifact is missing or empty: $artifact" >&2
    exit 1
  fi
done

cp -- model/seed_classifier.onnx deploy/
cp -- model/seed_classifier.onnx.data deploy/
cp -- model/classes.json deploy/
cp -- model/model_meta.json deploy/

git add -- \
  deploy/seed_classifier.onnx \
  deploy/seed_classifier.onnx.data \
  deploy/classes.json \
  deploy/model_meta.json \
  model/seed_classifier.onnx \
  model/seed_classifier.onnx.data \
  deploy_model.sh
if git diff --cached --quiet -- \
  deploy/seed_classifier.onnx \
  deploy/seed_classifier.onnx.data \
  deploy/classes.json \
  deploy/model_meta.json \
  model/seed_classifier.onnx \
  model/seed_classifier.onnx.data \
  deploy_model.sh
then
  echo "No model deployment changes to commit."
  exit 0
fi

git commit -m "Deploy updated seed classifier model" -- \
  deploy/seed_classifier.onnx \
  deploy/seed_classifier.onnx.data \
  deploy/classes.json \
  deploy/model_meta.json \
  model/seed_classifier.onnx \
  model/seed_classifier.onnx.data \
  deploy_model.sh
git push origin HEAD
