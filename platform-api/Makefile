start:
	docker-compose build
	docker-compose up

seed:
	docker-compose exec -e MONGODB_URL=mongodb://admin:secret@mongo:27017 api node bin/seed 
