# Matcha Dating App - Simple Makefile
# Simple but useful commands for development

.PHONY: help all build up down logs shell-backend shell-frontend shell-db db-init clean fclean

# Docker Compose file
DOCKER_COMPOSE = docker compose -f docker-compose.dev.yml

# Default target
help: ## Show available commands
	@echo "Matcha Dating App - Simple Commands"
	@echo "=================================="
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make <command>\n\nCommands:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  %-15s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

all: build up ## Build and start everything (recommended)

build: ## Build and start all services
	@echo "🔨 Building and starting Matcha application..."
	@$(DOCKER_COMPOSE) up --build -d
	@echo "✅ Application is running!"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔥 Backend API: http://localhost:5000"
	@echo "🗄️  Database Admin: http://localhost:8080"

up: ## Start all services (without building)
	@echo "🚀 Starting Matcha application..."
	@$(DOCKER_COMPOSE) up -d
	@echo "✅ Application is running!"
	@echo "🌐 go to /frontend & run  npm install & npm run dev"
	@echo "🔥 Backend API: http://localhost:5000"
	@echo "🗄️  Database Admin: http://localhost:8080"

down: ## Stop all services
	@echo "🛑 Stopping Matcha application..."
	@$(DOCKER_COMPOSE) down
	@echo "✅ Application stopped!"

logs: ## Show logs from all containers
	@echo "📋 Showing logs from all containers..."
	@$(DOCKER_COMPOSE) logs -f

logs-backend: ## Show backend container logs
	@echo "📋 Backend logs:"
	@$(DOCKER_COMPOSE) logs -f backend

# logs-frontend: ## Show frontend container logs  
# 	@echo "📋 Frontend logs:"
# 	@$(DOCKER_COMPOSE) logs -f frontend

logs-db: ## Show database container logs
	@echo "📋 Database logs:"
	@$(DOCKER_COMPOSE) logs -f postgres

shell-backend: ## Access backend container shell
	@echo "🐚 Entering backend container..."
	@$(DOCKER_COMPOSE) exec backend sh

# shell-frontend: ## Access frontend container shell
# 	@echo "🐚 Entering frontend container..."
# 	@$(DOCKER_COMPOSE) exec frontend sh

shell-db: ## Access database container shell
	@echo "🐚 Entering database container..."
	@$(DOCKER_COMPOSE) exec postgres psql -U $${POSTGRES_USER} -d $${POSTGRES_DB}

db-init: ## Initialize database with schema
	@echo "🗄️  Initializing database..."
	@echo "🔄 Starting PostgreSQL container..."
	@$(DOCKER_COMPOSE) up -d postgres
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	@sleep 10
	@echo "📊 Initializing database schema..."
	@$(DOCKER_COMPOSE) exec postgres psql -U matcha_user -d matcha_db -f /database-entrypoint-initdb.d/init.sql
	@echo "🛑 Stopping PostgreSQL container..."
	@$(DOCKER_COMPOSE) stop postgres
	@echo "✅ Database initialized successfully!"

clean: ## Stop and remove containers, networks, and volumes
	@echo "🧹 Cleaning up containers and volumes..."
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	@echo "✅ Cleanup finished (images preserved)!"

fclean: ## Complete cleanup - remove everything
	@echo "🧹 Complete cleanup - removing everything..."
	@echo "⚠️  This will remove all containers, images, volumes, and networks!"
	@$(DOCKER_COMPOSE) down -v --remove-orphans --rmi all
	@docker system prune -af --volumes
	@docker network prune -f
	@echo "✅ Complete cleanup finished!"

status: ## Show status of all containers
	@echo "📊 Container Status:"
	@$(DOCKER_COMPOSE) ps

restart: ## Restart all containers
	@echo "🔄 Restarting Matcha application..."
	@$(DOCKER_COMPOSE) restart
	@echo "✅ Application restarted!"

restart-backend: ## Restart only backend container
	@echo "🔄 Restarting backend container..."
	@$(DOCKER_COMPOSE) restart backend
	@echo "✅ Backend restarted!"

# restart-frontend: ## Restart only frontend container
# 	@echo "🔄 Restarting frontend container..."
# 	@$(DOCKER_COMPOSE) restart frontend
# 	@echo "✅ Frontend restarted!"

restart-adminer: ## Restart only adminer container
	@echo "🔄 Restarting adminer container..."
	@$(DOCKER_COMPOSE) restart adminer
	@echo "✅ Adminer restarted!"

restart-db: ## Restart only database container
	@echo "🔄 Restarting database container..."
	@$(DOCKER_COMPOSE) restart postgres
	@echo "✅ Database restarted!"

db-reset: ## Reset database - clear all data and reinitialize
	@echo "🗄️  Resetting database..."
	@echo "⚠️  This will delete ALL data in the database!"
	@$(DOCKER_COMPOSE) stop postgres
	@$(DOCKER_COMPOSE) rm -f postgres
	@docker volume rm matcha_postgres_data_dev 2>/dev/null || true
	@$(DOCKER_COMPOSE) up -d postgres
	@echo "⏳ Waiting for PostgreSQL to initialize..."
	@sleep 15
	@echo "✅ Database reset complete!"

mock-data: ## Create 100 mock profiles for testing (50 male, 50 female)
	@echo "🚀 Creating mock data for testing..."
	@echo "📝 This will create 100 realistic profiles with:"
	@echo "   • Complete user accounts (verified)"
	@echo "   • Profile pictures and bios"
	@echo "   • Interests and preferences"
	@echo "   • Likes, views, and connections"
	@echo "   • Geographic distribution"
	@echo "⏳ Ensuring backend container is running..."
	@$(DOCKER_COMPOSE) up -d backend
	@echo "⏳ Waiting for services to be ready..."
	@timeout /t 10 /nobreak > nul
	@echo "📊 Running mock data creation..."
	@$(DOCKER_COMPOSE) exec backend node scripts/createMockData.js
	@echo ""
	@echo "✅ Mock data created successfully!"
	@echo "🔑 All users have password: Password123!"
	@echo "📧 Email format: [username]@example.com"
	@echo "🌐 Frontend: http://localhost:3000"
