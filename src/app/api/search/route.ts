import { search, searchParamsSchema } from "./utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = searchParamsSchema.parse(Object.fromEntries(searchParams.entries()));

  const { code, ...data } = await search(params);

  if (code !== 200) {
    return Response.json(data, { status: code });
  }

  return Response.json(data);
}
