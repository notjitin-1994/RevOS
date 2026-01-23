#!/bin/bash

# Populate job cards and vehicles with actual data
# Uses the Supabase REST API

SUPABASE_URL="https://vcenkzwenmwsxybgmajl.supabase.co"
SUPABASE_KEY="sb_secret_VFat0FI6BERPP4rifpxBJg_9SuljTxQ"

echo "🔧 Populating database with actual data..."

# Update vehicles with color, fuel_type, transmission
echo "🚗 Updating vehicles..."
curl -s -X PATCH "$SUPABASE_URL/rest/v1/customer_vehicles?license_plate=eq.KL22TN6182" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "color": "Matte Black",
    "fuel_type": "Petrol",
    "transmission": "Manual",
    "current_mileage": 18000
  }' | head -5

curl -s -X PATCH "$SUPABASE_URL/rest/v1/customer_vehicles?license_plate=eq.KA03LB3232" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "color": "Orange",
    "fuel_type": "Petrol",
    "transmission": "Manual",
    "current_mileage": 3000
  }' | head -5

curl -s -X PATCH "$SUPABASE_URL/rest/v1/customer_vehicles?license_plate=eq.KA04HS6300" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "color": "Black",
    "fuel_type": "Petrol",
    "transmission": "Manual",
    "current_mileage": 45000
  }' | head -5

curl -s -X PATCH "$SUPABASE_URL/rest/v1/customer_vehicles?license_plate=eq.KA05MK1234" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "color": "White",
    "fuel_type": "Petrol",
    "transmission": "Manual",
    "current_mileage": 12000
  }' | head -5

curl -s -X PATCH "$SUPABASE_URL/rest/v1/customer_vehicles?license_plate=eq.KL01AB5678" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "color": "Red",
    "fuel_type": "Petrol",
    "transmission": "Manual",
    "current_mileage": 8000
  }' | head -5

echo ""
echo "✅ Vehicles updated!"

# Update job cards with labor hours, costs, and promised dates
echo "📝 Updating job cards..."

# JC-2025-0001 - Brake repair (urgent)
curl -s -X PATCH "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0001" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "labor_hours": 4.5,
    "labor_cost": 2700,
    "parts_cost": 4500,
    "total_cost": 7200,
    "promised_date": "2025-01-25",
    "promised_time": "17:00",
    "status": "in_progress",
    "lead_mechanic_id": null
  }' > /dev/null

# JC-2025-0002 - Timing belt (urgent)
curl -s -X PATCH "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0002" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "labor_hours": 6.0,
    "labor_cost": 3600,
    "parts_cost": 8500,
    "total_cost": 12100,
    "promised_date": "2025-01-20",
    "promised_time": "14:00",
    "status": "in_progress"
  }' > /dev/null

# JC-2025-0003 - New bike setup
curl -s -X PATCH "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0003" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "labor_hours": 3.5,
    "labor_cost": 2100,
    "parts_cost": 3200,
    "total_cost": 5300,
    "promised_date": "2025-01-24",
    "promised_time": "16:00",
    "status": "in_progress"
  }' > /dev/null

# JC-2025-0004 - Service
curl -s -X PATCH "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0004" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "labor_hours": 5.0,
    "labor_cost": 3000,
    "parts_cost": 5400,
    "total_cost": 8400,
    "promised_date": "2025-01-28",
    "promised_time": "12:00",
    "status": "in_progress"
  }' > /dev/null

# JC-2025-0005 - General service
curl -s -X PATCH "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0005" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "labor_hours": 2.0,
    "labor_cost": 1200,
    "parts_cost": 1800,
    "total_cost": 3000,
    "promised_date": "2025-02-05",
    "promised_time": "15:00",
    "status": "queued"
  }' > /dev/null

# JC-2025-0006 - Clutch repair (parts waiting)
curl -s -X PATCH "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0006" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "labor_hours": 7.5,
    "labor_cost": 4500,
    "parts_cost": 12000,
    "total_cost": 16500,
    "promised_date": "2025-01-30",
    "promised_time": "18:00",
    "status": "parts_waiting"
  }' > /dev/null

# JC-2025-0007 - Quality check
curl -s -X PATCH "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0007" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "labor_hours": 4.0,
    "labor_cost": 2400,
    "parts_cost": 3800,
    "total_cost": 6200,
    "promised_date": "2025-01-22",
    "promised_time": "13:00",
    "status": "quality_check"
  }' > /dev/null

# JC-2025-0008 - Ready
curl -s -X PATCH "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0008" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "labor_hours": 3.0,
    "labor_cost": 1800,
    "parts_cost": 2200,
    "total_cost": 4000,
    "promised_date": "2025-01-21",
    "promised_time": "11:00",
    "status": "ready"
  }' > /dev/null

# JC-2025-0009 - Delivered
curl -s -X PATCH "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0009" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "labor_hours": 2.5,
    "labor_cost": 1500,
    "parts_cost": 2500,
    "total_cost": 4000,
    "promised_date": "2025-01-15",
    "promised_time": "10:00",
    "status": "delivered"
  }' > /dev/null

# JC-2025-0010 - Draft
curl -s -X PATCH "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0010" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "labor_hours": 8.0,
    "labor_cost": 4800,
    "parts_cost": 15000,
    "total_cost": 19800,
    "promised_date": "2025-02-01",
    "promised_time": "17:00",
    "status": "draft"
  }' > /dev/null

echo "✅ Job cards updated!"

# Create checklist items for JC-2025-0001
echo "✅ Creating checklist items..."

JOB_CARD_ID=$(curl -s "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0001&select=id" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])")

curl -s -X POST "$SUPABASE_URL/rest/v1/job_card_checklist_items" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d "[
    {
      \"job_card_id\": \"$JOB_CARD_ID\",
      \"item_name\": \"Inspect brake system\",
      \"description\": \"Check all brake pads, rotors, and lines\",
      \"status\": \"completed\",
      \"priority\": \"urgent\",
      \"estimated_minutes\": 60,
      \"actual_minutes\": 45,
      \"labor_rate\": 600,
      \"display_order\": 1,
      \"completed_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    },
    {
      \"job_card_id\": \"$JOB_CARD_ID\",
      \"item_name\": \"Replace front brake pads\",
      \"description\": \"Install new front brake pads\",
      \"status\": \"completed\",
      \"priority\": \"urgent\",
      \"estimated_minutes\": 90,
      \"actual_minutes\": 75,
      \"labor_rate\": 600,
      \"display_order\": 2,
      \"completed_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    },
    {
      \"job_card_id\": \"$JOB_CARD_ID\",
      \"item_name\": \"Replace rear brake pads\",
      \"description\": \"Install new rear brake pads\",
      \"status\": \"in_progress\",
      \"priority\": \"urgent\",
      \"estimated_minutes\": 90,
      \"actual_minutes\": 30,
      \"labor_rate\": 600,
      \"display_order\": 3
    },
    {
      \"job_card_id\": \"$JOB_CARD_ID\",
      \"item_name\": \"Replace brake rotors\",
      \"description\": \"Install new brake rotors front and rear\",
      \"status\": \"pending\",
      \"priority\": \"high\",
      \"estimated_minutes\": 120,
      \"actual_minutes\": 0,
      \"labor_rate\": 600,
      \"display_order\": 4
    },
    {
      \"job_card_id\": \"$JOB_CARD_ID\",
      \"item_name\": \"Replace brake fluid\",
      \"description\": \"Flush and replace brake fluid\",
      \"status\": \"pending\",
      \"priority\": \"high\",
      \"estimated_minutes\": 60,
      \"actual_minutes\": 0,
      \"labor_rate\": 600,
      \"display_order\": 5
    },
    {
      \"job_card_id\": \"$JOB_CARD_ID\",
      \"item_name\": \"Test drive and final inspection\",
      \"description\": \"Test brakes and verify safety\",
      \"status\": \"pending\",
      \"priority\": \"urgent\",
      \"estimated_minutes\": 30,
      \"actual_minutes\": 0,
      \"labor_rate\": 600,
      \"display_order\": 6
    }
  ]" > /dev/null

# Update job card totals for JC-2025-0001
curl -s -X PATCH "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0001" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "total_checklist_items": 6,
    "completed_checklist_items": 2,
    "progress_percentage": 33
  }' > /dev/null

echo "✨ Database population complete!"
