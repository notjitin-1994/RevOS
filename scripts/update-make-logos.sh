#!/bin/bash
# ============================================================================
# UPDATE MAKE LOGOS - BASH SCRIPT
# ============================================================================
# This script updates the database with logo URLs for all makes.
# It executes the SQL scripts in the correct order.
#
# Usage:
#   chmod +x scripts/update-make-logos.sh
#   ./scripts/update-make-logos.sh
# ============================================================================

set -e  # Exit on any error

echo "=========================================================================="
echo "🏍️  MAKE LOGOS UPDATE SCRIPT"
echo "=========================================================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Source the environment variables
echo "📝 Loading environment variables..."
set -a
source .env.local
set +a

# Validate required variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" ]; then
    echo -e "${RED}❌ Error: Missing Supabase credentials in .env.local${NC}"
    exit 1
fi

# Extract database connection info from URL
# Format: https://xxxxx.supabase.co
DB_HOST=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's|https://||' | sed 's/:.*//')
DB_PORT=5432
DB_NAME=postgres

echo -e "${GREEN}✅ Environment loaded${NC}"
echo "   Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Function to execute SQL file
execute_sql() {
    local file=$1
    local description=$2

    echo -e "${YELLOW}📄 Executing: $description${NC}"
    echo "   File: $file"

    # Use psql if available, otherwise provide manual instructions
    if command -v psql &> /dev/null; then
        echo "   Executing via psql..."
        psql -h "$DB_HOST" -U postgres -d "$DB_NAME" -f "$file" || {
            echo -e "${RED}❌ Failed to execute $file${NC}"
            echo "   Please execute manually in your Supabase SQL editor:"
            echo "   1. Open Supabase Dashboard"
            echo "   2. Go to SQL Editor"
            echo "   3. Open and run: $file"
            return 1
        }
    else
        echo -e "${YELLOW}⚠️  psql not found${NC}"
        echo "   Please execute manually in your Supabase SQL Editor:"
        echo "   1. Open Supabase Dashboard: $NEXT_PUBLIC_SUPABASE_URL"
        echo "   2. Go to SQL Editor"
        echo "   3. Open and run: $file"
        read -p "   Press Enter after executing the SQL..."
    fi

    echo -e "${GREEN}✅ Completed: $description${NC}"
    echo ""
}

# Step 1: Create makes table and add logo_url column
execute_sql \
    "prisma/seeds/03_add_make_logos.sql" \
    "Create makes table and add logo support"

# Step 2: Create the update function
execute_sql \
    "prisma/seeds/04_update_motorcycle_logos_function.sql" \
    "Create logo update function"

# Step 3: Populate makes with logos
execute_sql \
    "prisma/seeds/05_populate_make_logos.sql" \
    "Populate make logos"

echo "=========================================================================="
echo -e "${GREEN}🎉 ALL SCRIPTS EXECUTED SUCCESSFULLY!${NC}"
echo "=========================================================================="
echo ""
echo "📊 Summary:"
echo "  ✅ Created 'makes' table with logo support"
echo "  ✅ Added 'logo_url' column to 'motorcycles' table"
echo "  ✅ Populated all makes with logo URLs"
echo "  ✅ Updated motorcycles table with logo URLs"
echo ""
echo "🔍 To verify the update, run:"
echo "   SELECT make, logo_url FROM motorcycles WHERE logo_url IS NOT NULL LIMIT 10;"
echo ""
echo "=========================================================================="
