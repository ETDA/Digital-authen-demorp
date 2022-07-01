#!/bin/bash

# Usage: execute.sh [WildFly mode] [configuration file]
#
# The default mode is 'standalone' and default configuration is based on the
# mode. It can be 'standalone.xml' or 'domain.xml'.

echo "=> Executing Customization script"

PROJECT=${1}
ENV=${2}
#SITE=${3}
#HSM_IP=${4}
GIT_DOMAIN_GROUP=${3}
GIT_ACCESS_TOKEN=${4}

BACKOFFICE_ENV=/app
BACKOFFICE_CONFIG=/app

RUN_DATE="date +%Y%m%d"
TMP_GIT=/tmp/${PROJECT}

function wait_for_server() {
  until `bash $JBOSS_CLI -c ":read-attribute(name=server-state)" 2> /dev/null | grep -q running`; do
    sleep 1
  done
}

function configure_signserver() {

  # Add configuration via signserver
  bash ${SIGNSERVER_CLI} setproperties ${SIGNSERVER_CONFIG}
  for FILE in /${SIGNSERVER_CERT}/tsa/*.pem; do
    TSA_PROFILE="$(basename ${FILE} .pem)"
    echo ${TSA_PROFILE}
    bash "${SIGNSERVER_CLI}" uploadsignercertificatechain "${TSA_PROFILE}" GLOB "${FILE}"
  done
  
  bash "${WILDFLY_CUSTOM}/syncAuthen.sh" ALL "${PROJECT}" "${ENV}" "${SITE}" "${GIT_DOMAIN_GROUP}" "${GIT_ACCESS_TOKEN}" ">> /var/log/cron.log 2&1"
  
  bash $SIGNSERVER_CLI reload all
}

function git_config() {
  echo "=> Start git configuration files"
  #SSL disable for testing
  #GIT_SSL_NO_VERIFY=true git clone "https://oauth2:${GIT_ACCESS_TOKEN}@${GIT_DOMAIN_GROUP}/${PROJECT}.git" "${TMP_GIT}"
  git clone "https://oauth2:${GIT_ACCESS_TOKEN}@${GIT_DOMAIN_GROUP}/${PROJECT}.git" "${TMP_GIT}"
  cp -p "${TMP_GIT}/${ENV}/.env" "${BACKOFFICE_CONFIG}"
  cp -p "${TMP_GIT}/${ENV}/idps.json" "${BACKOFFICE_CONFIG}"
  #cp -pr "${TMP_GIT}/${ENV}/${SITE}/signserver_customization" "${SIGNSERVER_CUSTOM}"
  #mkdir "${SIGNSERVER_CERT}"
  #cp -pr "${TMP_GIT}/${ENV}/${SITE}/certificates/authentication" "${SIGNSERVER_CERT}"
  #cp -pr "${TMP_GIT}/${ENV}/${SITE}/certificates/hsm" "${SIGNSERVER_CERT}"
  #cp -pr "${TMP_GIT}/${ENV}/${SITE}/certificates/tsa" "${SIGNSERVER_CERT}"
  #cp -p "${TMP_GIT}/${ENV}/${SITE}/wildfly_customization/${JBOSS_CONFIG}" "${SIGNSERVER_CUSTOM}"
  #cp -p "${TMP_GIT}/${ENV}/${SITE}/certificates/wildfly/keystore.jks" "${WILDFLY_CERT}"
  #cp -p "${TMP_GIT}/${ENV}/${SITE}/certificates/wildfly/truststore.jks" "${WILDFLY_CERT}"
  echo "=> Finish git configuration files"
}

function setup_hsm() {
  echo "=> Start setup and register HSM" 
  "${LUNA_CLIENT}/bin/vtl" addServer -n "${HSM_IP}" -c "${SIGNSERVER_CERT}/hsm/server/server.pem"
  cp "${SIGNSERVER_CERT}/hsm/client/${PROJECT}Key.pem" "${LUNA_CLIENT}/cert/client/"
  cp "${SIGNSERVER_CERT}/hsm/client/${PROJECT}.pem" "${LUNA_CLIENT}/cert/client/"
  "${LUNA_CLIENT}/bin/configurator" setValue -s Client -e ClientPrivKeyFile -v "${LUNA_CLIENT}/cert/client/${PROJECT}Key.pem"
  "${LUNA_CLIENT}/bin/configurator" setValue -s Client -e ClientCertFile -v "${LUNA_CLIENT}/cert/client/${PROJECT}.pem"
  "${LUNA_CLIENT}/bin/configurator" setValue -s Client -e TCPKeepAlive -v 1
  "${LUNA_CLIENT}/bin/configurator" setValue -s Client -e ClientKeepAlive -v 20
  echo "=> Finish setup and register HSM" 
}

function deploy_signserver() {
  echo "=> Start Signserver deployment" 
  bash "${SIGNSERVER_HOME}/bin/ant" deploy
  echo "=> Finish Signserver deployment" 
}

function start_BACKOFFICE_microservice() {

  echo "=> Starting RUN NODE JS"
  
  npm start
  
  echo "=> RUN NODE JS success"
}

function set_crontab() {
  echo "=> Start set sync crontab"
  /usr/sbin/cron
  #write out current crontab
  crontab -l > /tmp/tmpcron
  #echo new cron into cron file
  echo "${CERT_SYNC_TIME} * * * bash ${WILDFLY_CUSTOM}/syncAuthen.sh DATE ${PROJECT} ${ENV} ${SITE}" ">> /var/log/cron.log 2&1" >> /tmp/tmpcron
  #install new cron file
  crontab /tmp/tmpcron
  #rm /tmp/tmpcron
  echo "=> Finish set sync crontab"
}

# Main
git_config
#setup_hsm
#deploy_signserver
start_BACKOFFICE_microservice
# End Main

