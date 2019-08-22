Use the Docker container
========================

Download the latest release (here in ~/zusam):
```
mkdir -p ~/zusam && cd ~/zusam
version="$(curl -Ls -o /dev/null -w '%{url_effective}' https://github.com/nrobinaubertin/zusam/releases/latest | rev | cut -d'/' -f1 | rev)"
wget -qO- https://github.com/nrobinaubertin/zusam/archive/$version.tar.gz | tar xz --strip 1
```

Build the container:
```
sudo docker build -t zusam .
```

Start the container giving the path to the data directory as volume:
```
sudo docker run -p 80:8080 -v "$(pwd)/data:/zusam/data" --name zusam zusam
```

The default first username is `zusam` with the password `zusam`.
