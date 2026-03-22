-- Add hotScore column to threads
ALTER TABLE "threads" ADD COLUMN "hotScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Add tsvector column for full-text search
ALTER TABLE "threads" ADD COLUMN "search_vector" tsvector;

-- Create GIN index for fast FTS
CREATE INDEX "threads_search_vector_gin" ON "threads" USING gin("search_vector");

-- Create index for hot score sorting
CREATE INDEX "threads_hot_score_idx" ON "threads" ("hotScore" DESC) WHERE "deletedAt" IS NULL;

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_thread_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW."search_vector" := to_tsvector('turkish', coalesce(NEW.title, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to keep tsvector up to date
CREATE TRIGGER thread_search_vector_trigger
BEFORE INSERT OR UPDATE OF title ON "threads"
FOR EACH ROW EXECUTE FUNCTION update_thread_search_vector();

-- Backfill existing rows
UPDATE "threads" SET "search_vector" = to_tsvector('turkish', coalesce(title, ''));
