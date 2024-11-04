docker-compose run --volume="$(pwd)":/app --rm api pnpm install
docker-compose restart api
