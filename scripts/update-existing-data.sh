#!/bin/bash

# Update database with actual values using existing columns

SUPABASE_URL="https://vcenkzwenmwsxybgmajl.supabase.co"
SUPABASE_KEY="sb_secret_VFat0FI6BERPP4rifpxBJg_9SuljTxQ"

echo "🔧 Populating database with actual data (using existing columns)..."

# Update vehicles with color
echo "🚗 Updating vehicles..."
curl -s -X PATCH "$SUPABASE_URL/rest/v1/customer_vehicles?license_plate=eq.KL22TN6182" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"color": "Matte Black"}' > /dev/null

curl -s -X PATCH "$SUPABASE_URL/rest/v1/customer_vehicles?license_plate=eq.KA03LB3232" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"color": "Orange"}' > /dev/null

curl -s -X PATCH "$SUPABASE_URL/rest/v1/customer_vehicles?license_plate=eq.KA04HS6300" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"color": "Black"}' > /dev/null

echo "✅ Vehicles updated!"

# Update job cards with labor hours and costs
echo "📝 Updating job cards..."

# Get job card IDs
JC1=$(curl -s "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0001&select=id" -H "apikey: $SUPABASE_KEY" -H "Authorization: Bearer $SUPABASE_KEY" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null || echo "")
JC2=$(curl -s "$SUPABASE_URL/rest/v1/job_cards?job_card_number=eq.JC-2025-0002&select=id" -H "apikey: $SUPABASE_KEY" -H "Authorization: Bearer $SUPABASE_KEY" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null || echo "")

# Update JC-2025-0001
if [ -n "$JC1" ]; then
  curl -s -X PATCH "$SUPABASE_URL/rest/v1/job_cards?id=eq.$JC1" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "labor_hours": 4.5,
      "labor_cost": 2700,
      "parts_cost": 4500,
      "total_cost": 7200,
      "promised_date": "2025-01-25",
      "promised_time": "17:00"
    }' > /dev/null

  # Create checklist items for JC-2025-0001
  curl -s -X POST "$SUPABASE_URL/rest/v1/job_card_checklist_items" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d "[
      {\"job_card_id\": \"$JC1\", \"item_name\": \"Inspect brake system\", \"description\": \"Check all brake pads, rotors, and lines\", \"status\": \"completed\", \"priority\": \"urgent\", \"estimated_minutes\": 60, \"actual_minutes\": 45, \"labor_rate\": 600, \"display_order\": 1, \"completed_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"},
      {\"job_card_id\": \"$JC1\", \"item_name\": \"Replace front brake pads\", \"description\": \"Install new front brake pads\", \"status\": \"completed\", \"priority\": \"urgent\", \"estimated_minutes\": 90, \"actual_minutes\": 75, \"labor_rate\": 600, \"display_order\": 2, \"completed_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"},
      {\"job_card_id\": \"$JC1\", \"item_name\": \"Replace rear brake pads\", \"description\": \"Install new rear brake pads\", \"status\": \"in_progress\", \"priority\": \"urgent\", \"estimated_minutes\": 90, \"actual_minutes\": 30, \"labor_rate\": 600, \"display_order\": 3},
      {\"job_card_id\": \"$JC1\", \"item_name\": \"Replace brake rotors\", \"description\": \"Install new brake rotors\", \"status\": \"pending\", \"priority\": \"high\", \"estimated_minutes\": 120, \"actual_minutes\": 0, \"labor_rate\": 600, \"display_order\": 4},
      {\"job_card_id\": \"$JC1\", \"item_name\": \"Replace brake fluid\", \"description\": \"Flush and replace brake fluid\", \"status\": \"pending\", \"priority\": \"high\", \"estimated_minutes\": 60, \"actual_minutes\": 0, \"labor_rate\": 600, \"display_order\": 5},
      {\"job_card_id\": \"$JC1\", \"item_name\": \"Test drive and inspection\", \"description\": \"Test brakes and verify safety\", \"status\": \"pending\", \"priority\": \"urgent\", \"estimated_minutes\": 30, \"actual_minutes\": 0, \"labor_rate\": 600, \"display_order\": 6}
    ]" > /dev/null

  # Update checklist totals
  curl -s -X PATCH "$SUPABASE_URL/rest/v1/job_cards?id=eq.$JC1" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d '{"total_checklist_items": 6, "completed_checklist_items": 2, "progress_percentage": 33}' > /dev/null
fi

echo "✨ Database population complete!"
echo "📊 Job cards now have labor hours, costs, and checklist items!"
echo "🎨 Vehicles now have colors!"
