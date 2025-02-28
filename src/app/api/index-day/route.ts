import { db } from "@/db";
import { comic } from "@/db/schema";
import { openai } from "@ai-sdk/openai";
import { embedMany, generateObject } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";

const xkcdSchema = z.object({
  month: z.coerce.number(),
  num: z.number(),
  link: z.string(),
  year: z.coerce.number(),
  news: z.string(),
  safe_title: z.string(),
  /** May be an empty string, and in that case, we'll need to generate it */
  transcript: z.string(),
  alt: z.string(),
  img: z.string(),
  title: z.string(),
  day: z.coerce.number(),
});

const xkcdPrompt = z.object({
  transcript: z.string().describe("A transcript of the text and objects in the comic, for someone who is blind."),
  explaination: z.string().describe("A short explaination of the comic, especially the punchline."),
});

async function getFromXKCD(day: number) {
  const response = await fetch(`https://xkcd.com/${day}/info.0.json`);
  const data = await response.json();
  return xkcdSchema.parse(data);
}

const schema = z
  .object({
    day: z.coerce.number().positive(),
    endDay: z.coerce.number(),
  })
  .refine(({ day, endDay }) => day <= endDay, {
    message: "Day must be less than or equal to endDay",
    path: ["endDay"],
  })
  .or(z.object({}));

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = schema.parse(Object.fromEntries(searchParams.entries()));

  if (process.env.CRON_SECRET !== request.headers.get("Authorization") && process.env.CRON_SECRET !== undefined) {
    return new Response("Unauthorized", { status: 401 });
  }

  let day = 0;
  let endDay = 0;

  if ("day" in params) {
    day = params.day;
    endDay = params.endDay
  } else {
    const response = await fetch("https://xkcd.com/info.0.json");
    const data = await response.json();
    day = data.num;
    endDay = data.num;
  }

  const days = endDay - day + 1;

  let finished = 0;

  console.log(`Indexing ${days} days`, day, endDay);

  const results = await Promise.allSettled(
    new Array(days)
      .fill(0)
      .map((_, i) => day + i)
      .map(async day => {
        const existing = await db.query.comic.findFirst({ columns: { number: true }, where: eq(comic.number, day) });

        if (existing) {
          throw new Error("Comic already exists");
        }

        const xkcd = await getFromXKCD(day);

        const data = await generateObject({
          model: openai("gpt-4o-mini"),
          schema: xkcdPrompt,
          messages: [
            {
              role: "system",
              content: `Your job is to write a transcript and explaination for the given XKCD comic.`,
            },
            {
              role: "user",
              content: `
          Title: ${xkcd.title}
          Alt: ${xkcd.alt}
          Original transcript (may be empty): ${xkcd.transcript}
        `,
              experimental_attachments: [{ url: xkcd.img, contentType: `image/${xkcd.img.split(".").at(-1)}` }],
            },
          ],
        });

        const { transcript, explaination } = data.object;

        const embeddings = await embedMany({
          model: openai.embedding("text-embedding-3-small"),
          values: [transcript, explaination],
        });

        const result = await db
          .insert(comic)
          .values({
            number: xkcd.num,
            title: xkcd.title,
            alt: xkcd.alt,
            explaination,
            transcript,
            imgUrl: xkcd.img,
            publishedAt: new Date(xkcd.year, xkcd.month - 1, xkcd.day),
            indexedAt: new Date(),
            transcriptEmbedding: embeddings.embeddings[0],
            explainationEmbedding: embeddings.embeddings[1],
          })
          .returning();

        finished++;
        console.log(`Finished ${finished}/${days}`);
      })
  );

  const failed = results.filter(r => r.status === "rejected");

  console.log(failed.map(f => f.reason));

  return new Response(`OK, ${failed.length} failed`);
}

export { POST as GET };
