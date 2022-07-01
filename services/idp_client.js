'use strict'

const Issuer = require('openid-client').Issuer;

class IdpClient {
  constructor(clientInfo) {
    Issuer.defaultHttpOptions = { timeout: 10000 };
    const issuer = new Issuer({
      issuer: clientInfo.issuer,
      authorization_endpoint: clientInfo.authorization_endpoint,
      token_endpoint: clientInfo.token_endpoint,
      userinfo_endpoint: clientInfo.userinfo_endpoint,
      jwks_uri: clientInfo.jwks_uri,
    });
    this.client = new issuer.Client({
      client_id: clientInfo.client_id,
      client_secret: clientInfo.client_secret,
      //id_token_signed_response_alg: clientInfo.alg
    });
    this.issuer = clientInfo.issuer;
    this.authorization_endpoint = clientInfo.authorization_endpoint;
    this.token_endpoint = clientInfo.token_endpoint;
    this.userinfo_endpoint = clientInfo.userinfo_endpoint;
    this.jwks_uri = clientInfo.jwks_uri;
    this.client_id = clientInfo.client_id;
    this.client_secret = clientInfo.client_secret;
    this.assertion_consumer = clientInfo.assertion_consumer;
    this.scope = clientInfo.scope;
    this.ial = clientInfo.ial;
    this.aal = clientInfo.aal;
    this.sector = clientInfo.sector;
    this.idps = clientInfo.idps;
  }

  getAuthorizationUrl(state) {
    return this.client.authorizationUrl({
      redirect_uri: this.assertion_consumer,
      scope: this.scope,
      state: state,
      prompt: 'login consent',
      acr_values: [this.ial,this.aal,this.sector,this.idps].join(' '),
    });
  }

  getToken(query, state) {
    return this.client.callback(this.assertion_consumer, query, { state });
  }

  getIssuer() {
    return this.issuer;
  }

  getClientId() {
    return this.client_id;
  }

  getClientSecret() {
    return this.client_secret;
  }

  getAssertionConsumer() {
    return this.assertion_consumer;
  }
  async getUserinfo(access_token,id_token){
    let header = {
      headers:{
        Authorization: id_token
      }
    }
    return await this.client.userinfo(access_token,header) 
  }
  
}

module.exports = IdpClient;
