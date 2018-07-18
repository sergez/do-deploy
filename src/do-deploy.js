'use strict';

const _ = require('lodash'),
      fs = require('fs'),
      homedir = require('os').homedir(),
      DigitalOcean = require('do-wrapper').default;

class DoDeploy {

    constructor(options) {

        this.options = _.defaultsDeep(options, {
            doApiToken: '',
            doSshKeyName: 'default',

            localSshKeyFilepath: `${homedir}/.ssh/id_rsa.pub`,

            dropletTimeout: 10000,
            dropletGetipAttempts: 6,

            createDomains: false,

            ansible: {
                createInventoryFile: false,
                inventoryFilename: './hosts',
                pythonInterpreter: '/usr/bin/python'
            },

            serverDefaults: {
                size: 's-1vcpu-1gb',
                image: 'ubuntu-16-04-x64'
            },

            servers: []
        });
        
        this.api = new DigitalOcean(this.options.doApiToken);
        this.localSshKey = this.getSshKeyLocal();
    }

    getSshKeyLocal() {
        let sshKeyLocal = null;

        if (fs.statSync(this.options.localSshKeyFilepath)) {
            sshKeyLocal = fs.readFileSync(this.options.localSshKeyFilepath).toString().trim();
        } else {
            this.showError('Can\'t find file with ssh key');
        }
    
        return sshKeyLocal;
    }

    showError (error ) {
        console.log(error)
    }

    doesSshKeyExist() {
        return new Promise((resolve, reject) => {
            if (!this.localSshKey) {
                reject('Can\'t find file with local ssh key');
            }
    
            this.api
                .accountGetKeys()
                .then(response => {
                    let result = false;
    
                    _.forEach(_.get(response, 'body.ssh_keys', []), key => {
                        if(key.public_key === this.localSshKey) {
                            result = key.id;
                        }
                    });
    
                    resolve(result);
                })
                .catch(this.showError);
        });
    }

    deploySshKeyIfNeeded() {
        return new Promise(resolve => {

            this.doesSshKeyExist()
                .then(sshKeyId => {
                    if (!sshKeyId && this.localSshKey) {
                        this.api
                            .accountAddKey({
                                name: this.options.doSshKeyName,
                                public_key: this.localSshKey
                            })
                            .then(response => {
                                resolve(_.get(response, 'body.ssh_key.id', false));
                            })
                            .catch(this.showError);
                    } else {
                        resolve(sshKeyId);
                    }
                })
                .catch(this.showError);
        });
    }

    getDropletIps(droplets) {
        const promises = [],
            getIp = (droplet, attempt) => new Promise(resolve => {
                if (attempt >= this.options.dropletGetipAttempts) {
                    console.log(`It's not possible to get the IP. Droplet '${dropletId}'`);
                    return resolve();
                }

                this.api
                    .dropletsGetById(droplet.id)
                    .then(response => {
                        if (_.get(response, 'body.droplet.status', 'new') === 'active') { // locked === false
                            resolve({
                                name: droplet.name,
                                ip: _.get(response, 'body.droplet.networks.v4.0.ip_address')
                            });
                        } else {
                            console.log(`Waiting droplet '${droplet.name} (${droplet.id})' is active... Attempt #${attempt + 1}`);
                            setTimeout(() => getIp(droplet, ++attempt).then(resolve), this.options.dropletTimeout);
                        }
                    })
                    .catch(this.showError);
            });

        _.forEach(droplets, droplet => {
            promises.push(getIp(droplet, 0));
        });

        return Promise.all(promises);
    }

    deployDroplets(sshKeyId) {
        const promises = [];

        if (!sshKeyId) {
            return Promise.reject('It\'s not possible to deploy droplet without ssh key. Please check if ssh key is deployed correctly');
        }

        _.forEach(this.options.servers, server => {
            promises.push(
                this.api
                    .dropletsCreate({
                        name: server.name,
                        region: server.region,
                        size: _.get(server, 'size', this.options.serverDefaults.size),
                        image: _.get(server, 'image', this.options.serverDefaults.image),
                        ssh_keys: [sshKeyId],
                        tags: ['vpnserver']
                    })
                    .then(response => ({
                        name: server.name,
                        id: _.get(response, 'body.droplet.id', null)
                    }))
                    .catch(this.showError)
            );
        });

        return Promise
            .all(promises)
            .then(droplets => this.getDropletIps(droplets));
    }

    createAnsibleInventoryFile(droplets) {
        const fileContents = ['[dohosts]'];

        _.forEach(droplets, droplet => 
            fileContents.push(`${droplet.ip} ansible_python_interpreter=${this.options.ansible.pythonInterpreter}`)
        );

        fs.writeFileSync(this.options.ansible.inventoryFilename, fileContents.join("\r\n"));
    }

    createDomains(droplets) {
        const promises = [];

        _.forEach(droplets, droplet =>
            promises.push(new Promise(resolve => {
                this.api
                    .domainsGet(droplet.name)
                    .then(resolve)
                    .catch(() => {
                        this.api
                            .domainsCreate(droplet.name, droplet.ip)
                            .then(resolve)
                            .catch(this.showError);
                    });
            }))
        );

        return Promise.all(promises);
    }

    deploy() {
        this.deploySshKeyIfNeeded()
            .then(sshKeyId => {
                this.deployDroplets(sshKeyId)
                    .then(droplets => {
                        if (this.options.ansible.createInventoryFile) {
                            this.createAnsibleInventoryFile(droplets);
                        }

                        if (this.options.createDomains) {
                            this.createDomains(droplets);
                        }
                    });
            });
    }
}

module.exports = DoDeploy;