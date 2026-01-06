#!/bin/bash
# ════════════════════════════════════════════════════════════════
#                    VPS Initial Setup Script
#                    Kamaleon Ecosystem
# ════════════════════════════════════════════════════════════════
# Run this on a fresh Ubuntu/Debian VPS

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           Kamaleon VPS Setup                                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

# Update system
echo "→ Updating system packages..."
apt-get update && apt-get upgrade -y

# Install Docker
echo "→ Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh

    # Enable Docker to start on boot
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose plugin
echo "→ Installing Docker Compose..."
apt-get install -y docker-compose-plugin

# Create app directory
echo "→ Creating application directory..."
mkdir -p /opt/kamaleon

# Setup firewall
echo "→ Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw allow 3000/tcp  # API Gateway
    ufw --force enable
fi

# Create swap if not exists (for low memory VPS)
if [ ! -f /swapfile ]; then
    echo "→ Creating swap file..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           VPS Setup Complete!                                  ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  Docker version: $(docker --version | cut -d' ' -f3)"
echo "║  Compose version: $(docker compose version --short)"
echo "║                                                               ║"
echo "║  Next steps:                                                  ║"
echo "║  1. Run the deploy script from your local machine            ║"
echo "║  2. Edit /opt/kamaleon/.env with production values           ║"
echo "║  3. Run: cd /opt/kamaleon && docker compose up -d            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
