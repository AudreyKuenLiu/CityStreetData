#!/bin/bash

set -e

export PATH="/opt/chron_venv/bin:$PATH";
apt-get install -y locales;
apt-get install -y python3.13-venv;
apt-get install -y build-essential python3-dev;
python3 -m venv /opt/chron_venv;

pip install "pandas==2.3.3";
pip install "requests==2.32.4";