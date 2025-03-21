import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchResultCard } from "@/components/ui/search-result-card";
import { AlertCircle } from "lucide-react";
import { z } from "zod";
import { search, searchParamsSchema } from "../api/search/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";

interface SearchResult {
  number: number;
  imgUrl: string;
  title: string;
  similarity: unknown;
  transcriptScore: number;
  explainationScore: number;
}

export default async function Page({ searchParams }: { searchParams: Promise<unknown> }) {
  try {
    const params = searchParamsSchema.omit({ minScore: true, limit: true }).parse(await searchParams);
    const { code, ...data } = await search({ ...params, minScore: 0.2, limit: 9 });

    if ("error" in data) {
      return (
        <div className='container mx-auto py-8'>
          <Alert variant='destructive' className='mb-6'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{data.error}</AlertDescription>
          </Alert>
        </div>
      );
    }

    const query = params.q;
    const currentPage = Math.floor(params.offset / 9) + 1;
    const totalPages = Math.ceil(data.total / 9);

    return (
      <div className='container mx-auto py-8'>
        <form action='/search' method='GET' className='mb-8 space-y-4 max-w-full'>
          <Button variant='link' asChild className='p-0'>
            <Link href='/'>&larr; Back to home</Link>
          </Button>
          <div className='flex gap-2'>
            <Input name='q' placeholder='Search for a comic' defaultValue={params.q} />
            <Button type='submit'>Search</Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='sort'>Sort by</Label>
              <Select name='sort' defaultValue={params.sort}>
                <SelectTrigger id='sort'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='transcript'>Transcript</SelectItem>
                  <SelectItem value='both'>Both</SelectItem>
                  <SelectItem value='explaination'>Explaination</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='order'>Order</Label>
              <Select name='order' defaultValue={params.order}>
                <SelectTrigger id='order'>
                  <SelectValue placeholder='Order' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='desc'>Descending</SelectItem>
                  <SelectItem value='asc'>Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <div className='mb-6 space-y-2'>
          <h1 className='text-2xl font-bold'>Search Results</h1>
          <p className='text-muted-foreground'>
            Found {data.total} results for "{query}"
          </p>
        </div>

        {data.results.length === 0 ? (
          <div className='rounded-lg border p-8 text-center'>
            <h2 className='mb-2 text-xl font-semibold'>No results found</h2>
            <p className='text-muted-foreground'>Try searching for something else or adjusting your search parameters.</p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8'>
              {data.results.map((result: SearchResult) => (
                <SearchResultCard
                  key={result.number}
                  number={result.number}
                  imgUrl={result.imgUrl}
                  title={result.title}
                  similarity={result.similarity as number | undefined}
                  transcriptScore={result.transcriptScore}
                  explainationScore={result.explainationScore}
                />
              ))}
            </div>

            <div className='flex justify-center gap-2'>
              {currentPage > 1 && (
                <Button variant='outline' asChild>
                  <Link href={`/search?q=${query}&offset=${(currentPage - 2) * 9}`}>Previous</Link>
                </Button>
              )}
              <span className='flex items-center px-4'>
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Button variant='outline' asChild>
                  <Link href={`/search?q=${query}&offset=${currentPage * 9}`}>Next</Link>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return (
        <div className='container mx-auto py-8'>
          <Alert variant='destructive' className='mb-6'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.flatten().formErrors}</AlertDescription>
          </Alert>
        </div>
      );
    } else {
      throw error;
    }
  }
}
