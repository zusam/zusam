Use the Docker container
========================

Download the latest release (here in ~/zusam):
```
mkdir -p ~/zusam && cd ~/zusam
version="$(curl -Ls -o /dev/null -w '%{url_effective}' https://github.com/zusam/zusam/releases/latest | rev | cut -d'/' -f1 | rev)"
wget -qO- https://github.com/zusam/zusam/archive/$version.tar.gz | tar xz --strip 1
```

Build the container:
```
sudo docker build -t zusam .
```

Start the container giving the path to the data directory as volume:
```
sudo docker run -p 80:8080 -v "$(pwd)/data:/zusam/data" --name zusam -e INIT_USER=email@domain.example -e INIT_PASSWORD=initpass zusam
```

The login for the first user is `email@domain.example` with the password `initpass` in this example.  
Please change the initial password after initialization since it's public if passed as an docker ENV variable.  
If you don't specify an `INIT_USER`/`INIT_PASSWORD`, they will default to `zusam`.
