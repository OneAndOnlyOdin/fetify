#/bin/sh
docker run -dt -p 3040:3000 --env-file .env --name fetify --restart=always fetify:master