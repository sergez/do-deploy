const DoDeploy = require('./src/do-deploy');

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