# do-deploy
Deploy DigitalOcean droplets easy based on your configuration.

There is the possibility to generate an ansible inventory file to use it in further droplets configuration.

### Install
```sh
$ npm install do-deploy --save
```

### Usage
In order to use ```do-deploy``` you have to generate an API token on the DigitalOcean website. Furthermore, you have had ssh key on your local machine.

Here you can find instruction how to generate ssh keys:
- [Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-1604 "Ubuntu")
- [Windows](https://docs.joyent.com/public-cloud/getting-started/ssh-keys/generating-an-ssh-key-manually/manually-generating-your-ssh-key-in-windows "Windows")

```js
const DoDeploy = require('do-deploy');

const doDeploy = new DoDeploy({
    doApiToken: '<YOUR_DO_API_TOKEN>',

    ansible: {
        createInventoryFile: true,
        pythonInterpreter: '/usr/bin/python3'
    },

    createDomains: true,

    servers: [
        {
            name: 'ams-001.example.com',
            region: 'ams3'
        }
    ]
});

doDeploy.deploy();
```
*Note: replace <YOUR_DO_API_TOKEN> with your API token.

### Options
|  Option | Type  | Default   | Description  |
| ------------ | ------------ | ------------ | ------------ |
|  doApiToken | *string*  |    |  DigitalOcean API token |
| doSshKeyName  | *string*  |  default  | The name of SSH key that will be created on DO and added to each of your droplets |
| localSshKeyFilepath  | *string*  |  <USER_HOME_DIR>/.ssh/id_rsa.pub | File path to your local public SSH key. Used to deploy SSH keys to DO.  |
| dropletTimeout  | *integer*  |  10 000 ms | Waiting time when the server is active  |
| dropletGetipAttempts  | *integer*  |  6  | The number of attempts  |
| createDomains  | *boolean*  |  false | Indicates that create DNS records on DO or not. The name of the server will be used as the name for DNS record  |
| ansible.createInventoryFile  | *boolean*  |  false | Creates ansible inventory file  |
| ansible.inventoryFilename  | *string*  |  ./hosts | The file path of ansible inventory file  |
| ansible.pythonInterpreter  | *string*  |  /usr/bin/python | The value of ```python_interpriter``` property in the inventory file |
| serverDefaults.size  | *string*  |  s-1vcpu-1gb | Default droplet size  |
| serverDefaults.image  | *string*  |  ubuntu-16-04-x64 | Default droplet image  |
| servers[].name  | *string*  |   | Droplet name  |
| servers[].region  | *string*  |   | Droplet region  |

### Issues
Please submit an issue on GitHub with repro steps.

### License
The MIT License

Copyright 2018 Serhii Zvinskyi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
