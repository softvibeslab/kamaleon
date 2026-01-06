#!/bin/bash
# ════════════════════════════════════════════════════════════════
#                    Development Setup Script
#                    Kamaleon Ecosystem
# ════════════════════════════════════════════════════════════════

set -e

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           Kamaleon Development Setup                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Create .env from example if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"

echo "→ Gateway..."
cd "$SCRIPT_DIR/gateway" && npm install && cd "$SCRIPT_DIR"

echo "→ Dashboard Backend..."
cd "$SCRIPT_DIR/dashboard/backend" && npm install && cd "$SCRIPT_DIR"

echo "→ Dashboard Frontend..."
cd "$SCRIPT_DIR/dashboard/frontend" && npm install && cd "$SCRIPT_DIR"

echo "→ Mobile App..."
cd "$SCRIPT_DIR/mobile/app" && npm install && cd "$SCRIPT_DIR"

echo -e "${GREEN}✓ All dependencies installed${NC}"

# Start Docker services
echo -e "\n${YELLOW}Starting Docker services (postgres, redis)...${NC}"
docker-compose up -d postgres redis

# Wait for postgres
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
until docker-compose exec -T postgres pg_isready -U kamaleon > /dev/null 2>&1; do
    sleep 1
done
echo -e "${GREEN}✓ PostgreSQL is ready${NC}"

# Run migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
cd "$SCRIPT_DIR/dashboard/backend"
npx prisma migrate dev --name init
cd "$SCRIPT_DIR"
echo -e "${GREEN}✓ Migrations complete${NC}"

# Seed database (if seed script exists)
if [ -f "$SCRIPT_DIR/dashboard/backend/src/prisma/seed.ts" ]; then
    echo -e "\n${YELLOW}Seeding database...${NC}"
    cd "$SCRIPT_DIR/dashboard/backend" && npx prisma db seed && cd "$SCRIPT_DIR"
    echo -e "${GREEN}✓ Database seeded${NC}"
fi

echo -e "\n╔═══════════════════════════════════════════════════════════════╗"
echo -e "║           ${GREEN}Setup Complete!${NC}                                    ║"
echo -e "╠═══════════════════════════════════════════════════════════════╣"
echo -e "║  To start development:                                        ║"
echo -e "║                                                               ║"
echo -e "║  1. Start all services:                                       ║"
echo -e "║     ${YELLOW}docker-compose up${NC}                                        ║"
echo -e "║                                                               ║"
echo -e "║  2. Or run individually:                                      ║"
echo -e "║     ${YELLOW}cd gateway && npm run dev${NC}                               ║"
echo -e "║     ${YELLOW}cd dashboard/backend && npm run dev${NC}                     ║"
echo -e "║     ${YELLOW}cd dashboard/frontend && npm run dev${NC}                    ║"
echo -e "║     ${YELLOW}cd mobile/app && npm start${NC}                              ║"
echo -e "║                                                               ║"
echo -e "║  Access points:                                               ║"
echo -e "║  - Gateway:    http://localhost:3000                          ║"
echo -e "║  - Dashboard:  http://localhost:5173                          ║"
echo -e "║  - Backend:    http://localhost:3001                          ║"
echo -e "║  - Adminer:    http://localhost:8080                          ║"
echo -e "╚═══════════════════════════════════════════════════════════════╝"
