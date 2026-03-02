Install using Docker
========================

To run Zusam using the pre-compiled container on Dockerhub, first create a directory:
```
mkdir -p ~/zusam && cd ~/zusam
```

Start the container giving the path to the data directory as volume:
```
sudo docker run -p 80:8080 -v "$(pwd)/data:/zusam/data" --name zusam -e INIT_USER=email@domain.example -e INIT_PASSWORD=initpass -e APP_ENV=prod zusam/zusam:latest
```

Once it starts up, you can access Zusam at http://localhost:8080

In this example, the login for the first user is `email@domain.example` with the password `initpass` in this example.

The default starting user, group and password are `zusam`.

Environment explanations:
- DATABASE_NAME: name of the sqlite3 database file
- INIT_GROUP: name of the initial group to be created
- INIT_PASSWORD: password of the initial user to be created (defaults to "zusam" if unset)
- INIT_USER: name of the initial user to be created
- SUBPATH: specify if zusam needs to be served in a subpath (use "/foo" if you want to serve it on "example.com/foo")
- APP_ENV: the environment. Must be "prod" unless the image was built with "dev" or "test" environment



## Docker Compose


You may prefer to use docker compose. If you haven't already, make a folder:
```
mkdir -p ~/zusam && cd ~/zusam
```
Add a new file called "compose.yaml" using your preferred text editor, then add the following:
```
services:
  zusam:
    image: zusam/zusam:latest
    environment:
      - DATABASE_NAME=data.db
      - INIT_GROUP=zusam
      - INIT_PASSWORD=zusam
      - INIT_USER=zusam
      - SUBPATH=
      - APP_ENV=prod
    restart: always
    volumes:
      - ./data/:/zusam/data
    ports:
      - "80:8080"
```

See environment variables listed above for more information.

Once you are ready, start the container with:
```
sudo docker compose up -d
```

Once it starts up, you can access Zusam at http://localhost:8080


## Build the container yourself

You may want to build the container yourself. First, download the version you want. Download the latest release (here in ~/zusam):
```
mkdir -p ~/zusam && cd ~/zusam
version="$(curl -Ls -o /dev/null -w '%{url_effective}' https://github.com/zusam/zusam/releases/latest | rev | cut -d'/' -f1 | rev)"
curl -Ls https://github.com/zusam/zusam/archive/refs/tags/$version.tar.gz | tar xz --strip 1
```

You can also instead download the latest version from the `next` branch where development happens, but beware that it might be less tested:
```
mkdir -p ~/zusam && cd ~/zusam
curl -Ls https://github.com/zusam/zusam/archive/refs/heads/next.tar.gz | tar xz --strip 1
```

To build the container:
```
make prod
```

Now follow the instructions about for `docker run` or `docker compose`, using `zusam` as the image, instead of `zusam/zusam:latest`.

If you are building for development, see [dev/README.md](https://github.com/zusam/zusam/tree/master/dev).



