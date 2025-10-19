#!/bin/bash

# Запуск бота через Gunicorn для production
gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 60 bot:app
