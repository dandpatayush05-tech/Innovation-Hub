-- Add intelligence_data column to destinations
ALTER TABLE destinations ADD intelligence_data jsonb DEFAULT '{}';

-- Optional: You can run an UPDATE here to populate mock intelligence data for testing.
-- For example:
/*
UPDATE destinations SET intelligence_data = '{
  "where_to_go": ["Eiffel Tower", "Louvre Museum", "Montmartre", "Seine River"],
  "how_to_reach": {
    "flight": "Direct flights available to CDG.",
    "train": "Eurostar connects from London in 2.5 hours."
  },
  "best_time_to_visit": {
    "months": "April to June, October to early November",
    "notes": "Spring and Fall offer mild weather and fewer crowds."
  },
  "what_to_do": ["Sightseeing", "Wine Tasting", "Art Tours"],
  "budget": {
    "hotel": 150,
    "food": 60,
    "activities": 40
  }
}' WHERE name = 'Paris';
*/
