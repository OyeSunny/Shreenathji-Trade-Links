-- Keep the publicly displayed price unit independent from the minimum order
-- unit: a buyer may order 25 MT while the owner quotes per kg, for example.
ALTER TABLE "Product" ADD COLUMN "priceUnit" TEXT;
