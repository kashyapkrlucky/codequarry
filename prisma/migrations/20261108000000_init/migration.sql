-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CheatsheetStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "parent_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technologies" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cheatsheets" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category_id" UUID NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'beginner',
    "reading_time" INTEGER NOT NULL DEFAULT 5,
    "status" "CheatsheetStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "search_vector" tsvector,

    CONSTRAINT "cheatsheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cheatsheet_tags" (
    "cheatsheet_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "cheatsheet_tags_pkey" PRIMARY KEY ("cheatsheet_id","tag_id")
);

-- CreateTable
CREATE TABLE "cheatsheet_technologies" (
    "cheatsheet_id" UUID NOT NULL,
    "technology_id" UUID NOT NULL,

    CONSTRAINT "cheatsheet_technologies_pkey" PRIMARY KEY ("cheatsheet_id","technology_id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" UUID NOT NULL,
    "cheatsheet_id" UUID NOT NULL,
    "helpful" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_sort_order_idx" ON "categories"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "technologies_slug_key" ON "technologies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cheatsheets_slug_key" ON "cheatsheets"("slug");

-- CreateIndex
CREATE INDEX "cheatsheets_category_id_status_idx" ON "cheatsheets"("category_id", "status");

-- CreateIndex
CREATE INDEX "cheatsheets_status_published_at_idx" ON "cheatsheets"("status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "cheatsheets_status_view_count_idx" ON "cheatsheets"("status", "view_count" DESC);

-- CreateIndex
CREATE INDEX "cheatsheets_status_featured_idx" ON "cheatsheets"("status", "featured");

-- CreateIndex
CREATE INDEX "cheatsheets_search_vector_idx" ON "cheatsheets" USING GIN ("search_vector");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "cheatsheet_tags_tag_id_idx" ON "cheatsheet_tags"("tag_id");

-- CreateIndex
CREATE INDEX "cheatsheet_technologies_technology_id_idx" ON "cheatsheet_technologies"("technology_id");

-- CreateIndex
CREATE INDEX "feedback_cheatsheet_id_idx" ON "feedback"("cheatsheet_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cheatsheets" ADD CONSTRAINT "cheatsheets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cheatsheet_tags" ADD CONSTRAINT "cheatsheet_tags_cheatsheet_id_fkey" FOREIGN KEY ("cheatsheet_id") REFERENCES "cheatsheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cheatsheet_tags" ADD CONSTRAINT "cheatsheet_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cheatsheet_technologies" ADD CONSTRAINT "cheatsheet_technologies_cheatsheet_id_fkey" FOREIGN KEY ("cheatsheet_id") REFERENCES "cheatsheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cheatsheet_technologies" ADD CONSTRAINT "cheatsheet_technologies_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_cheatsheet_id_fkey" FOREIGN KEY ("cheatsheet_id") REFERENCES "cheatsheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

