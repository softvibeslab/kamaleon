#!/bin/bash
# ════════════════════════════════════════════════════════════════
#                    Deployment Script
#                    Kamaleon Ecosystem
# ════════════════════════════════════════════════════════════════

set -e

# Configuration
VPS_HOST="${VPS_HOST:-root@31.97.145.53}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/kamaleon}"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           Kamaleon Deployment                                  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "\n${YELLOW}Step 1: Creating deployment archive...${NC}"

# Create a clean archive excluding node_modules and other dev files
cd "$SCRIPT_DIR"
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.env' \
    --exclude='dist' \
    --exclude='.next' \
    --exclude='coverage' \
    -czvf /tmp/kamaleon-deploy.tar.gz \
    docker-compose.prod.yml \
    .env.production.example \
    gateway \
    dashboard \
    shared \
    scripts/setup-vps.sh

echo -e "${GREEN}✓ Archive created${NC}"

echo -e "\n${YELLOW}Step 2: Uploading to VPS...${NC}"
scp /tmp/kamaleon-deploy.tar.gz "$VPS_HOST:/tmp/"
echo -e "${GREEN}✓ Upload complete${NC}"

echo -e "\n${YELLOW}Step 3: Deploying on VPS...${NC}"
ssh "$VPS_HOST" << 'ENDSSH'
set -e

DEPLOY_PATH="/opt/kamaleon"

# Create directory if not exists
mkdir -p $DEPLOY_PATH
cd $DEPLOY_PATH

# Backup existing .env if exists
if [ -f .env ]; then
    cp .env .env.backup
fi

# Extract new files
tar -xzvf /tmp/kamaleon-deploy.tar.gz

# Restore .env if it existed
if [ -f .env.backup ]; then
    mv .env.backup .env
else
    # First deploy - create .env from example
    if [ -f .env.production.example ]; then
        cp .env.production.example .env
        echo "⚠️  Please edit /opt/kamaleon/.env with your production values!"
    fi
fi

# Rename compose file
mv docker-compose.prod.yml docker-compose.yml 2>/dev/null || true

# Pull and rebuild containers
docker compose pull
docker compose build --no-cache
docker compose up -d

# Show status
docker compose ps

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Deployment complete!"
echo "  "
echo "  IMPORTANT: If this is the first deploy, edit the .env file:"
echo "  nano /opt/kamaleon/.env"
echo "  "
echo "  Then restart: docker compose up -d"
echo "═══════════════════════════════════════════════════════════════"
ENDSSH

echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Deployment Complete!                                 ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Access your services:"
echo "  - API Gateway: http://31.97.145.53:3000"
echo "  - Dashboard:   http://31.97.145.53"
