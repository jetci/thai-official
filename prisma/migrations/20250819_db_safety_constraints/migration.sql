-- up
-- Safely ensure unique index on RefreshToken.jti without creating duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class t
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_index i ON i.indrelid = t.oid
    JOIN pg_class ix ON ix.oid = i.indexrelid
    WHERE n.nspname = 'public'
      AND t.relname = 'RefreshToken'
      AND i.indisunique = true
      AND pg_get_indexdef(ix.oid) ILIKE '%("jti")%'
  ) THEN
    CREATE UNIQUE INDEX refresh_token_jti_ux ON "RefreshToken"("jti");
  END IF;
END $$;

-- Safely ensure unique index on Subscription.userId without creating duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class t
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_index i ON i.indrelid = t.oid
    JOIN pg_class ix ON ix.oid = i.indexrelid
    WHERE n.nspname = 'public'
      AND t.relname = 'Subscription'
      AND i.indisunique = true
      AND pg_get_indexdef(ix.oid) ILIKE '%("userId")%'
  ) THEN
    CREATE UNIQUE INDEX subscription_user_ux ON "Subscription"("userId");
  END IF;
END $$;

-- down
DROP INDEX IF EXISTS refresh_token_jti_ux;
DROP INDEX IF EXISTS subscription_user_ux;
