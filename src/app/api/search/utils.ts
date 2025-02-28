import { db } from "@/db";
import { comic } from "@/db/schema";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { AnyColumn, asc, cosineDistance, desc, gt, or, sql, SQLWrapper } from "drizzle-orm";
import { z } from "zod";

export const searchParamsSchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().positive().max(50).min(1).default(10),
  offset: z.coerce.number().min(0).default(0),
  sort: z.enum(["transcript", "explaination", "both"]).default("both"),
  order: z.enum(["asc", "desc"]).default("desc"),
  minScore: z.coerce.number().min(0).max(1).default(0),
});

export async function search(data: z.infer<typeof searchParamsSchema>) {
  try {
    const { q, limit, offset, sort, order, minScore } = searchParamsSchema.parse(data);

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

    return { results, code: 200 };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: "Invalid search parameters",
        code: 400,
        details: error.errors,
      };
    }
    return {
      error: "Internal server error",
      code: 500,
    };
  }
}
