CREATE EXTENSION vector;

CREATE TABLE "comic" (
	"number" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"imgUrl" text NOT NULL,
	"alt" text NOT NULL,
	"transcript" text NOT NULL,
	"explaination" text NOT NULL,
	"transcriptEmbedding" vector(1536),
	"explainationEmbedding" vector(1536),
	"indexedAt" timestamp DEFAULT now() NOT NULL,
	"publishedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "transcriptEmbeddingIndex" ON "comic" USING hnsw ("transcriptEmbedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "explainationEmbeddingIndex" ON "comic" USING hnsw ("explainationEmbedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "publishedAtIndex" ON "comic" USING btree ("publishedAt");