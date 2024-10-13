Use the Docker container
========================

Download the latest release (here in ~/zusam):
```
mkdir -p ~/zusam && cd ~/zusam
version="$(curl -Ls -o /dev/null -w '%{url_effective}' https://github.com/zusam/zusam/releases/latest | rev | cut -d'/' -f1 | rev)"
curl -Ls https://github.com/zusam/zusam/archive/refs/tags/$version.tar.gz | tar xz --strip 1
```

You can also instead download the latest version from the master branch but beware that it might be less tested:
```
mkdir -p ~/zusam && cd ~/zusam
curl -Ls https://github.com/zusam/zusam/archive/refs/heads/master.tar.gz | tar xz --strip 1
```

You can either build the container or use the one provided [on the dockerhub](https://hub.docker.com/r/zusam/zusam).

To build the container:
```
make prod
```

Start the container giving the path to the data directory as volume:
```
sudo docker run -p 80:8080 -v "$(pwd)/data:/zusam/data" --name zusam -e INIT_USER=email@domain.example -e INIT_PASSWORD=initpass zusam
```

The login for the first user is `email@domain.example` with the password `initpass` in this example.  
Please change the initial password after initialization since it's public if passed as an docker ENV variable.  
If you don't specify an `INIT_USER`/`INIT_PASSWORD`, they will default to `zusam`.

---

In some situation, you could prefer to use a docker-compose file. Here is a quick example of a zusam service:

```
services:
  zusam:
    # Adapt the next line to use the latest version of zusam
    # https://hub.docker.com/r/zusam/zusam/tags
    image: zusam/zusam:0.5.5
    environment:
      - DATABASE_NAME=data.db
      - INIT_GROUP=zusam
      - INIT_PASSWORD=zusam
      - INIT_USER=zusam
      - SUBPATH=
    restart: always
    volumes:
      # "/path/to/your/data/dir" should be replaced
      - /path/to/your/data/dir:/zusam/data
    ports:
      - "80:8080"
```

Environment explanations:
- DATABASE_NAME: name of the sqlite3 database file
- INIT_GROUP: name of the initial group to be created
- INIT_PASSWORD: password of the initial user to be created
- INIT_USER: name of the initial user to be created
- SUBPATH: specify if zusam needs to be served in a subpath (use "/foo" if you want to serve it on "example.com/foo")
