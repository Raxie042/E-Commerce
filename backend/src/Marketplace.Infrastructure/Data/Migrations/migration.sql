CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;
CREATE TABLE "Categories" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "ParentId" uuid,
    CONSTRAINT "PK_Categories" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Categories_Categories_ParentId" FOREIGN KEY ("ParentId") REFERENCES "Categories" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "Users" (
    "Id" uuid NOT NULL,
    "Email" text NOT NULL,
    "PasswordHash" text NOT NULL,
    "Role" text NOT NULL,
    "FirstName" text NOT NULL,
    "LastName" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

CREATE TABLE "WebhookEvents" (
    "Id" uuid NOT NULL,
    "StripeEventId" text NOT NULL,
    "Type" text NOT NULL,
    "Payload" text NOT NULL,
    "ProcessedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_WebhookEvents" PRIMARY KEY ("Id")
);

CREATE TABLE "Addresses" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "Line1" text NOT NULL,
    "Line2" text,
    "City" text NOT NULL,
    "Region" text NOT NULL,
    "PostalCode" text NOT NULL,
    "Country" text NOT NULL,
    "IsDefault" boolean NOT NULL,
    CONSTRAINT "PK_Addresses" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Addresses_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Carts" (
    "Id" uuid NOT NULL,
    "BuyerId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Carts" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Carts_Users_BuyerId" FOREIGN KEY ("BuyerId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Sellers" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "StoreName" text NOT NULL,
    "Description" text NOT NULL,
    "StripeConnectAccountId" text,
    "PayoutEnabled" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Sellers" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Sellers_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Orders" (
    "Id" uuid NOT NULL,
    "BuyerId" uuid NOT NULL,
    "ShippingAddressId" uuid,
    "TotalAmount" numeric(18,2) NOT NULL,
    "Status" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Orders" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Orders_Addresses_ShippingAddressId" FOREIGN KEY ("ShippingAddressId") REFERENCES "Addresses" ("Id"),
    CONSTRAINT "FK_Orders_Users_BuyerId" FOREIGN KEY ("BuyerId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Products" (
    "Id" uuid NOT NULL,
    "SellerId" uuid NOT NULL,
    "CategoryId" uuid,
    "Title" text NOT NULL,
    "Description" text NOT NULL,
    "BasePrice" numeric(18,2) NOT NULL,
    "Status" text NOT NULL,
    "ImageUrl" text,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Products" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Products_Categories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES "Categories" ("Id"),
    CONSTRAINT "FK_Products_Sellers_SellerId" FOREIGN KEY ("SellerId") REFERENCES "Sellers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Payments" (
    "Id" uuid NOT NULL,
    "OrderId" uuid NOT NULL,
    "StripePaymentIntentId" text NOT NULL,
    "Amount" numeric(18,2) NOT NULL,
    "Status" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Payments" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Payments_Orders_OrderId" FOREIGN KEY ("OrderId") REFERENCES "Orders" ("Id") ON DELETE CASCADE
);

CREATE TABLE "SubOrders" (
    "Id" uuid NOT NULL,
    "OrderId" uuid NOT NULL,
    "SellerId" uuid NOT NULL,
    "Subtotal" numeric(18,2) NOT NULL,
    "PlatformFee" numeric(18,2) NOT NULL,
    "SellerPayout" numeric(18,2) NOT NULL,
    "Status" text NOT NULL,
    "StripeTransferId" text,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_SubOrders" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_SubOrders_Orders_OrderId" FOREIGN KEY ("OrderId") REFERENCES "Orders" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_SubOrders_Sellers_SellerId" FOREIGN KEY ("SellerId") REFERENCES "Sellers" ("Id") ON DELETE CASCADE
);

CREATE TABLE "ProductVariants" (
    "Id" uuid NOT NULL,
    "ProductId" uuid NOT NULL,
    "Name" text NOT NULL,
    "Sku" text NOT NULL,
    "PriceOverride" numeric(18,2),
    "StockQuantity" integer NOT NULL,
    CONSTRAINT "PK_ProductVariants" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ProductVariants_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Reviews" (
    "Id" uuid NOT NULL,
    "BuyerId" uuid NOT NULL,
    "ProductId" uuid NOT NULL,
    "Rating" integer NOT NULL,
    "Body" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Reviews" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Reviews_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Reviews_Users_BuyerId" FOREIGN KEY ("BuyerId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE "CartItems" (
    "Id" uuid NOT NULL,
    "CartId" uuid NOT NULL,
    "ProductVariantId" uuid NOT NULL,
    "Quantity" integer NOT NULL,
    CONSTRAINT "PK_CartItems" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_CartItems_Carts_CartId" FOREIGN KEY ("CartId") REFERENCES "Carts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_CartItems_ProductVariants_ProductVariantId" FOREIGN KEY ("ProductVariantId") REFERENCES "ProductVariants" ("Id") ON DELETE CASCADE
);

CREATE TABLE "OrderItems" (
    "Id" uuid NOT NULL,
    "SubOrderId" uuid NOT NULL,
    "ProductVariantId" uuid NOT NULL,
    "Quantity" integer NOT NULL,
    "UnitPriceAtPurchase" numeric(18,2) NOT NULL,
    CONSTRAINT "PK_OrderItems" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_OrderItems_ProductVariants_ProductVariantId" FOREIGN KEY ("ProductVariantId") REFERENCES "ProductVariants" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_OrderItems_SubOrders_SubOrderId" FOREIGN KEY ("SubOrderId") REFERENCES "SubOrders" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_Addresses_UserId" ON "Addresses" ("UserId");

CREATE INDEX "IX_CartItems_CartId" ON "CartItems" ("CartId");

CREATE INDEX "IX_CartItems_ProductVariantId" ON "CartItems" ("ProductVariantId");

CREATE UNIQUE INDEX "IX_Carts_BuyerId" ON "Carts" ("BuyerId");

CREATE INDEX "IX_Categories_ParentId" ON "Categories" ("ParentId");

CREATE INDEX "IX_OrderItems_ProductVariantId" ON "OrderItems" ("ProductVariantId");

CREATE INDEX "IX_OrderItems_SubOrderId" ON "OrderItems" ("SubOrderId");

CREATE INDEX "IX_Orders_BuyerId" ON "Orders" ("BuyerId");

CREATE INDEX "IX_Orders_ShippingAddressId" ON "Orders" ("ShippingAddressId");

CREATE UNIQUE INDEX "IX_Payments_OrderId" ON "Payments" ("OrderId");

CREATE INDEX "IX_Products_CategoryId" ON "Products" ("CategoryId");

CREATE INDEX "IX_Products_SellerId" ON "Products" ("SellerId");

CREATE INDEX "IX_ProductVariants_ProductId" ON "ProductVariants" ("ProductId");

CREATE UNIQUE INDEX "IX_ProductVariants_Sku" ON "ProductVariants" ("Sku");

CREATE UNIQUE INDEX "IX_Reviews_BuyerId_ProductId" ON "Reviews" ("BuyerId", "ProductId");

CREATE INDEX "IX_Reviews_ProductId" ON "Reviews" ("ProductId");

CREATE UNIQUE INDEX "IX_Sellers_UserId" ON "Sellers" ("UserId");

CREATE INDEX "IX_SubOrders_OrderId" ON "SubOrders" ("OrderId");

CREATE INDEX "IX_SubOrders_SellerId" ON "SubOrders" ("SellerId");

CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");

CREATE UNIQUE INDEX "IX_WebhookEvents_StripeEventId" ON "WebhookEvents" ("StripeEventId");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260615175819_InitialCreate', '10.0.9');

COMMIT;

