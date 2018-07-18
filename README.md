# do-deploy
Deploy DigitalOcean servers based on your configuration.

### Install
```sh
$ npm install do-deploy --save
```

### Usage
In order to use ```do-deploy``` you have to generate an API token on the DigitalOcean website.

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
*Note: replace <YOUR_DO_API_TOKEN> with your API token.*

### Issues
Please submit an issue on GitHub with repro steps.

### License
The MIT License

Copyright 2018 Serhii Zvinskyi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.