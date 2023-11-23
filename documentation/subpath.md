Subpath
=======

It is possible to serve Zusam on a subpath instead of at the root of your domain.  
This is useful when you want to host multiple services on the same domain (like Zusam and Wordpress for example).  

If you are deploying Zusam as a docker container, you can use the `SUBPATH` environment variable to force it on a subpath.  
In the following example "/foo" is used as subpath:
```
sudo docker run -p 80:8080 -v "$(pwd)/data:/zusam/data" --name zusam -e SUBPATH=/foo -e INIT_USER=email@domain.example -e INIT_PASSWORD=initpass zusam
```

---

If you are not using docker, you will need to adapt the configuration of your webserver and modify the entrypoint of zusam.  
To change the subpath of Zusam's webapp, modify the [`index.html`](https://github.com/zusam/zusam/blob/master/app/dist/index.html) file (initially located in `app/dist/` in this repository) and change the `<base href="/">` to the desired subpath. 
For example, `<base href="/foo/">`. Note that you need the slash at the end.  
If you are using nginx as webserver, you can use [`container/nginx/nginx-subpath.conf`](https://github.com/zusam/zusam/blob/master/container/nginx/nginx-subpath.conf) as an example configuration.
This is the configuration used by the container where `@SUBPATH@` gets replaced by the chosen subpath (in this example it would be "/foo", without the ending slash).
