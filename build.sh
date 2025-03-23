#!/bin/bash
npm install --production=true
npm install --no-save @scalar/nestjs-api-reference ts-loader webpack webpack-cli
npm run build
