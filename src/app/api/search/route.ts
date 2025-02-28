import { db } from "@/db";
import { comic } from "@/db/schema";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { AnyColumn, asc, cosineDistance, desc, gt, sql, SQLWrapper } from "drizzle-orm";
import { searchParamsSchema } from "./utils";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { q, limit, offset, sort, order, minScore } = searchParamsSchema.parse(Object.fromEntries(searchParams.entries()));

  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: q,
  });

  const similarity = (col: AnyColumn | SQLWrapper) => sql<number>`1 - (${cosineDistance(col, embedding)})`;

  const similarityCol = {
    transcript: similarity(comic.transcriptEmbedding),
    explaination: similarity(comic.explainationEmbedding),
    both: sql`(${similarity(comic.transcriptEmbedding)} + ${similarity(comic.explainationEmbedding)}) / 2`,
  };

  const results = await db
    .select({
      number: comic.number,
      imgUrl: comic.imgUrl,
      title: comic.title,
      similarity: similarityCol[sort],
      transcriptScore: similarity(comic.transcriptEmbedding),
      explainationScore: similarity(comic.explainationEmbedding),
    })
    .from(comic)
    .where(gt(similarityCol[sort], minScore))
    .orderBy(t => (order === "asc" ? asc : desc)(t.similarity))
    .limit(limit)
    .offset(offset);

  console.log(results);

  return Response.json(results);
}
