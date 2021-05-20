include .env
#user=..
#servers=..

.PHONY: step01
step01:
	npm i -g @nestjs/cli

app:
	mkdir app		
step02: app
	cd app && nest new api
step03:
	cd app/api && npm install @nestjs/graphql graphql-tools graphql apollo-server-express class-validator uuid

generate_types:
	cd app/api && ./node_modules/.bin/ts-node src/scripts/generate.ts
	
step04:
	curl -X POST http://localhost:4000/graphql -H "Content-Type: application/json" -d '{ "query":"query { article(  id: 1 ){ id, title, content } }"}'

#ssh-manual-update:
#	apt -y update; apt -y upgrade; 
#	adduser dev-user; 
# usermod -g ssh dev-user; 
#	usermod -g staff dev-user;

ssh-login:
	$(foreach server, $(servers),  ssh-copy-id  $(user)@$(server);)
	
ssh-ls:
	$(foreach server, $(servers),  ssh $(user)@$(server) "ls -a";)

step90:
	kubectl delete all --all # delete all resources in all namespaces

