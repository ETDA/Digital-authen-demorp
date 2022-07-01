'use strict'

const Issuer = require('openid-client').Issuer
const IdpClient = require('./idp_client');
const idps = require('../idps')['idps'];

class IdpClients {
 
  constructor() {
    this.clients = {}
    idps.map((obj) => {
      this.clients[obj.name] = new IdpClient(obj); 
    });
  } 

  getClient(clientName) {
    return this.clients[clientName];
  }
}

module.exports = IdpClients
