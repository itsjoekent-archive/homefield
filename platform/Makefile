start:
	docker-compose build
	docker-compose up

seed:
	docker-compose exec -e MONGODB_URL=mongodb://admin:secret@mongo:27017 api node bin/seed

# deploy-staging:
# 	heroku container:login
# 	docker build -t homefield-platform-api:latest .
# 	docker tag homefield-platform-api registry.heroku.com/homefield-platform-api-staging/web
# 	docker push registry.heroku.com/homefield-platform-api-staging/web
# 	heroku container:release web --app homefield-platform-api-staging

# deploy-staging:
# 	docker build -t homefield-platform-api:latest .
# 	docker tag homefield-platform-api us.gcr.io/homefield/platform-api
# 	docker push us.gcr.io/homefield/platform-api
# 	gcloud run deploy platform-api-staging --image us.gcr.io/homefield/platform-api:latest
#
# seed-staging:
# 	docker
# 	docker exec -e MONGODB_URL= api node bin/seed
