docker service create \
  --name img-processor_app \
  --limit-memory 512MB \
  --replicas 3 \
  --network beta-labs \
  --network beta-wan \
  betalabs/node-graphicsmagick