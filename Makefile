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

step90:
	kubectl delete all --all # delete all resources in all namespaces

#ssh-manual-root-update:
#	apt -y update; apt -y upgrade;
#	adduser dev-user; 
# usermod -g ssh dev-user; 
#	usermod -g staff dev-user;

step10 ssh-docker-install:
	$(foreach server, $(servers),  ssh root@$(server)	" apt -y install apt-transport-https software-properties-common ca-certificates curl gnupg lsb-release; echo  'deb [arch=amd64] https://download.docker.com/linux/debian  buster stable' | tee /etc/apt/sources.list.d/docker.list > /dev/null ;  curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - ; add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian buster stable" ; apt -y update; apt -y remove docker docker-engine docker.io containerd runc; apt -y install docker-ce docker-ce-cli containerd.io; usermod -aG docker $(user) " \ ;)

ssh-login:
	$(foreach server, $(servers),  ssh-copy-id  $(user)@$(server);)
	
ssh-ls:
	$(foreach server, $(servers),  ssh $(user)@$(server) "ls -a";)


