import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  return (
    <div className='flex flex-col items-center justify-center h-screen space-y-5'>
      <h1 className='text-4xl font-bold'>Relevant XKCD</h1>
      <p className='text-lg'>Search for XKCD comics</p>
      <form action='/search' method='GET' className='space-y-4 max-w-full w-96'>
        <div className='flex gap-2'>
          <Input name='q' placeholder='Search for a comic' />
          <Button type='submit'>Search</Button>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='sort'>Sort by</Label>
          <Select name='sort' defaultValue='both'>
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
          <Select name='order' defaultValue='desc'>
            <SelectTrigger id='order'>
              <SelectValue placeholder='Order' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='desc'>Descending</SelectItem>
              <SelectItem value='asc'>Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </div>
  );
}
