#!/bin/bash

# Build files
npm run build

# Bump the version number
npm version patch

# Publish to npm
npm publish --access public

# Git push tags
git push --tags

# Clean up build files
rm src/**/*.js
rm src/**/*.js.map
rm src/**/*.d.ts
