"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Link2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

interface SearchResultProps {
  number: number;
  imgUrl: string;
  title: string;
  transcriptScore?: number;
  explainationScore?: number;
  similarity?: number;
}

export function SearchResultCard({ number, imgUrl, title, transcriptScore, explainationScore, similarity }: SearchResultProps) {
  const xkcdUrl = `https://xkcd.com/${number}`;
  const imageRef = useRef<HTMLImageElement>(null);
  const [copied, setCopied] = useState(false);

  const didCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Link href={xkcdUrl} target='_blank' rel='noopener noreferrer'>
      <Card className='group overflow-hidden transition-all duration-300 hover:shadow-lg'>
        <CardHeader className='p-4 pb-2'>
          <div className='flex items-center justify-between'>
            <div>
              <span className='text-sm font-medium text-muted-foreground'>#{number}</span>
              <h3 className='font-semibold line-clamp-1'>{title}</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-4 pt-2'>
          <div className='relative aspect-square w-full overflow-hidden rounded-md'>
            <Image src={imgUrl} alt={title} ref={imageRef} fill className='object-contain transition-transform duration-300' />
          </div>
        </CardContent>
        <CardFooter className='flex justify-between p-4 pt-0'>
          {similarity && <div className='text-xs text-muted-foreground'>Match: {(similarity * 100).toFixed(0)}%</div>}
          <div className='opacity-0 transition-opacity group-hover:opacity-100 flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-8'
              onClick={async e => {
                e.preventDefault();
                const image = imageRef.current;
                if (!image) return;

                const blob = await fetch(image.src).then(res => res.blob());

                await navigator.clipboard.write([
                  new ClipboardItem({
                    "image/png": blob,
                  }),
                ]);

                didCopy();
              }}
            >
              <Copy />
              {copied ? "Copied!" : "Copy image"}
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-8'
                    onClick={e => {
                      e.preventDefault();
                      navigator.clipboard.writeText(xkcdUrl);
                    }}
                  >
                    <Link2 />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy url</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
