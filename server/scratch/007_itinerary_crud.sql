-- Add new CRUD columns to the itineraries table
ALTER TABLE itineraries ADD name text;
ALTER TABLE itineraries ADD start_date date;
ALTER TABLE itineraries ADD end_date date;
ALTER TABLE itineraries ADD travelers integer DEFAULT 1;
ALTER TABLE itineraries ADD notes text;
ALTER TABLE itineraries ADD cover_image text;
ALTER TABLE itineraries ADD is_public boolean DEFAULT false;

-- The days jsonb column remains the same but its internal structure will be 
-- expanded by the frontend to hold more detailed activities.
