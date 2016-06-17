blackhole-client
================

**blackhole-client** is a node.js console application for connecting to kazoo's websockets application blackhole.
It connects to kazoo and dumps conference events.

**blackhole-client** utilizes a node.js kazoo crossbar library ([https://github.com/macpie/crossbar-nodejs](https://github.com/macpie/crossbar-nodejs)) for gaining authentication to Kazoo.

#### Application Setup Instructions

**blackhole-client** requires node.js.  Follow [these instructions](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager) to install node on your target machine.

You will need git installed in order to clone the blackhole-client repo and to install the package dependencies for **blackhole-client** (crossbar lib).

###### Follow these instructions to get blackhole-client setup

```
git clone https://github.com/jamhed/blackhole-client.git
cd blackhole-client
npm install
cp config.js.sample config.js
# (Make Edits to the file that reflect your kazoo server details and credentials)
vim config.js 
node app
```
