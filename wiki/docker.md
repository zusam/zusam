Use the Docker container
========================

Clone the repository:
```
git clone https://github.com/nrobinaubertin/zusam.git
cd zusam
```

Build the container:
```
sudo docker build -t zusam .
```

Start the container giving the path to the data directory as volume:
```
sudo docker run -p 80:8080 -v "$(pwd)/data:/zusam/data" --name zusam zusam
```
