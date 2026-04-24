#!/usr/bin/env bash
set -e

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ─── Helper functions ─────────────────────────────────────────────────────────
info()    { echo -e "${BLUE}[INFO]${NC}    $1"; }
success() { echo -e "${GREEN}[OK]${NC}      $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}    $1"; }
error()   { echo -e "${RED}[ERROR]${NC}   $1"; }

# ─── Project root ─────────────────────────────────────────────────────────────
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PID=""
FRONTEND_PID=""

# ─── Cleanup on exit ─────────────────────────────────────────────────────────
cleanup() {
    echo ""
    warn "Shutting down..."
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null
        success "Backend stopped."
    fi
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null
        success "Frontend stopped."
    fi
    # Clean up ports one more time
    lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true
    success "Cleanup complete. Goodbye!"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# ─── Banner ───────────────────────────────────────────────────────────────────
echo -e "${CYAN}${BOLD}"
cat << 'BANNER'

 __        __         _            _    ___
 \ \      / /_ _ ___ | |_ ___     / \  |_ _|
  \ \ /\ / / _` / __|| __/ _ \   / _ \  | |
   \ V  V / (_| \__ \| ||  __/  / ___ \ | |
    \_/\_/ \__,_|___/ \__\___| /_/   \_\___|

    AI Waste Management Route Optimizer
    ─────────────────────────────────────

BANNER
echo -e "${NC}"

# ─── 1. Kill existing processes on ports 3001 and 5173 ───────────────────────
info "Cleaning up ports 3001 and 5173..."
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null && warn "Killed process on port 3001" || true
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null && warn "Killed process on port 5173" || true
success "Ports are free."

# ─── 2. Check / Start PostgreSQL ─────────────────────────────────────────────
info "Checking PostgreSQL..."
if pg_isready -q 2>/dev/null; then
    success "PostgreSQL is already running."
else
    warn "PostgreSQL is not running. Starting..."
    if brew services start postgresql@14 2>/dev/null; then
        success "Started postgresql@14 via Homebrew."
    elif brew services start postgresql 2>/dev/null; then
        success "Started postgresql via Homebrew."
    else
        error "Could not start PostgreSQL. Please start it manually."
        exit 1
    fi

    # Wait for PostgreSQL to be ready
    info "Waiting for PostgreSQL to be ready..."
    RETRIES=0
    MAX_RETRIES=30
    until pg_isready -q 2>/dev/null; do
        RETRIES=$((RETRIES + 1))
        if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
            error "PostgreSQL did not become ready in time."
            exit 1
        fi
        sleep 1
    done
    success "PostgreSQL is ready."
fi

# ─── 3. Create database if it doesn't exist ──────────────────────────────────
info "Checking database 'waste_management'..."
if psql -lqt 2>/dev/null | cut -d\| -f1 | grep -qw waste_management; then
    success "Database 'waste_management' already exists."
else
    info "Creating database 'waste_management'..."
    if createdb waste_management 2>/dev/null; then
        success "Database 'waste_management' created."
    else
        error "Failed to create database. Check your PostgreSQL configuration."
        exit 1
    fi
fi

# ─── 4. Install backend dependencies ─────────────────────────────────────────
info "Installing backend dependencies..."
cd "$PROJECT_DIR/backend"
npm install --silent 2>&1
success "Backend dependencies installed."

# ─── 5. Install frontend dependencies ────────────────────────────────────────
info "Installing frontend dependencies..."
cd "$PROJECT_DIR/frontend"
npm install --silent 2>&1
success "Frontend dependencies installed."

# ─── 6. Seed the database ────────────────────────────────────────────────────
info "Running database seed script..."
cd "$PROJECT_DIR/backend"
if [ -f seed.js ]; then
    node seed.js
    success "Database seeded."
else
    warn "seed.js not found in backend/. Skipping seed step."
fi

# ─── 7. Ensure nodemon is available ──────────────────────────────────────────
info "Checking for nodemon..."
if ! command -v nodemon &>/dev/null && ! npx nodemon --version &>/dev/null; then
    warn "nodemon not found. Installing globally..."
    npm install -g nodemon
    success "nodemon installed."
else
    success "nodemon is available."
fi

# ─── 8. Start backend (nodemon, port 3001) ───────────────────────────────────
info "Starting backend on port 3001..."
cd "$PROJECT_DIR/backend"

# Determine the backend entry file
BACKEND_ENTRY=""
for f in server.js index.js app.js; do
    if [ -f "$f" ]; then
        BACKEND_ENTRY="$f"
        break
    fi
done

if [ -z "$BACKEND_ENTRY" ]; then
    error "No backend entry file found (server.js, index.js, or app.js)."
    exit 1
fi

PORT=3001 npx nodemon "$BACKEND_ENTRY" &
BACKEND_PID=$!
success "Backend started (PID: $BACKEND_PID) with nodemon watching $BACKEND_ENTRY"

# ─── 9. Start frontend (Vite dev server, port 5173) ──────────────────────────
info "Starting frontend on port 5173..."
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
success "Frontend started (PID: $FRONTEND_PID)"

# ─── 10. Print summary ───────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  Application is running!${NC}"
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC}  ${BOLD}http://localhost:5173${NC}"
echo -e "  ${BLUE}Backend:${NC}   ${BOLD}http://localhost:3001${NC}"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services.${NC}"
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════${NC}"
echo ""

# ─── 11. Wait for background processes ───────────────────────────────────────
wait $BACKEND_PID $FRONTEND_PID
