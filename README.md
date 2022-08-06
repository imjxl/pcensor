# PCensor
private content censor base on nsfwjs

# required

+ node.js
+ yarn
+ jemalloc lib


# How to install

1. First install [nvm](https://github.com/nvm-sh/nvm) or ignore if you have install node.js.
   ````
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   source  ~/.bashrc
   nvm install --lts
   npm install -g npm
   ````

2. Install yarn and all package
   ````
   npm install -g yarn

   yarn install
   ````

3. Test it
   ````
   node server.js
   ````

4. Install libjemalloc, It's will happen  memory leak if not install (because of [sharp](https://github.com/lovell/sharp). it's cost me a lot of time).
   ````
   #download the file from https://github.com/jemalloc/jemalloc/releases
   tar -jxvf jemalloc-5.3.0.tar.bz2
   cd jemalloc-5.3.0
   ./autogen.sh

   #please install gcc if failure
   apt-get -y install autoconf gcc libxslt-dev xsltproc docbook-xsl

   make dist
   make install
   ln -s /usr/local/lib/libjemalloc.so.2 /usr/lib/x86_64-linux-gnu/libjemalloc.so.1
   ````

5. Now you can start it by start.sh. you need change node path and libjemalloc.so path if you change it
   ````
   chomd +x start.sh
   ./start.sh
   ````

6. Manage it by systemd
   ````
   cp systemd/pcensor.service /etc/systemd/system/
   systemctl daemon-reload
   systemctl start pcensor
   # start after system restart
   systemctl enable pcensor
   ````
7. Config nginx reverse proxy(optional)
   ````
    location /pcensorApi {
            proxy_pass http://127.0.0.1:8080;
    }
   ````

## Usage

curl --request POST 'http://127.0.0.1:8080/pcensorApi' --form 'image=@"/home/1.jpg"'
or
curl --request POST 'http://127.0.0.1:8080/pcensorApi' --form 'image="url"'