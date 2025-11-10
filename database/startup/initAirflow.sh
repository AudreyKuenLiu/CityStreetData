#!/bin/bash
set -e

export PATH="/opt/airflow_venv/bin:$PATH";
export AIRFLOW_HOME=${AIRFLOW_HOME}
export AIRFLOW__CORE__AUTH_MANAGER="airflow.providers.fab.auth_manager.fab_auth_manager.FabAuthManager"
export AIRFLOW__CORE__EXECUTOR="SequentialExecutor"
export AIRFLOW__DATABASE__SQL_ALCHEMY_CONN="sqlite:////opt/airflow/airflow.db"
export AIRFLOW__CORE__FERNET_KEY=${AIRFLOW__CORE__FERNET_KEY}
export _AIRFLOW_WWW_USER_USERNAME=${_AIRFLOW_WWW_USER_USERNAME}
export _AIRFLOW_WWW_EMAIL=${_AIRFLOW_WWW_EMAIL}
export _AIRFLOW_WWW_USER_PASSWORD=${_AIRFLOW_WWW_USER_PASSWORD}
export AIRFLOW__CORE__EXECUTION_API_SERVER_URL=${AIRFLOW__CORE__EXECUTION_API_SERVER_URL}

apt-get install -y locales;
apt-get install -y python3 python3-pip python3.13-venv;
python3 -m venv /opt/airflow_venv;
#airflow dependencies
pip install --upgrade pip;
pip install 'connexion==2.14.2';
pip install lxml;
pip install beautifulsoup4;
pip install flask_session;
pip install "flask-appbuilder<5.0.0";
pip install 'apache-airflow==3.1.2';
pip install apache-airflow-providers-fab;
pip install graphviz;
#python dependencies
pip install pandas;
pip install python-dateutil;

# Initialize Airflow database
airflow fab-db migrate;
airflow db migrate;

# Create an admin user (change credentials as needed)
airflow users create \
    --username ${_AIRFLOW_WWW_USER_USERNAME}\
    --firstname admin \
    --lastname admin \
    --role Admin \
    --email ${_AIRFLOW_WWW_EMAIL} \
    --password ${_AIRFLOW_WWW_USER_PASSWORD};

#airflow api-server --port 8081 -D 
#airflow scheduler -D 