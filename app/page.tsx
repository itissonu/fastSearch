"use client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useEffect, useState } from 'react';

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{
    results: string[];
    duration: number;
  }>();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!input) return setSearchResults(undefined);

      try {
        const res = await fetch(`/api/search?q=${input}`);
        if (res.status === 429) {
          const data = await res.json();
          setErrorMessage(data.message);
          const remainingSeconds = parseInt(data.message.match(/(\d+)/)[0], 10);
          setRemainingTime(remainingSeconds);

          const timer = setInterval(() => {
            setRemainingTime(prevTime => {
              if (prevTime <= 1) {
                clearInterval(timer);
                setErrorMessage('');
                return 0;
              }
              return prevTime - 1;
            });
          }, 2000);

          return;
        }
        const data = (await res.json()) as { results: string[]; duration: number };
        setSearchResults(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [input]);

  return (
    <main className='h-screen w-screen grainy'>
      <div className='flex flex-col gap-6 items-center pt-32 duration-500 animate-in animate fade-in-5 slide-in-from-bottom-2.5'>
        <h1 className='text-5xl tracking-tight font-bold'>SpeedSearch ⚡</h1>
        <p className='text-zinc-600 text-lg max-w-prose text-center'>
          A high-performance API built with Hono, Next.js, and Cloudflare. <br />{' '}
          Type a query below and get your results in milliseconds.
        </p>

        <div className='max-w-md w-full'>
          <Command>
            <CommandInput
              value={input}
              disabled={!!errorMessage}
              onValueChange={setInput}
              placeholder='Search countries...'
              className='placeholder:text-zinc-500'
            />
            <CommandList>
              {errorMessage ? (
                <CommandEmpty className='text-red-700 font-bold m-2'>
                  {errorMessage.replace(/\d+/, remainingTime.toString())}
                </CommandEmpty>
              ) : (
                <>
                  {searchResults?.results.length === 0 ? (
                    <CommandEmpty>No results found.</CommandEmpty>
                  ) : null}

                  {searchResults?.results ? (
                    <CommandGroup heading='Results'>
                      {searchResults?.results.map((result) => (
                        <CommandItem key={result} value={result} onSelect={setInput}>
                          {result}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : null}

                  {searchResults?.results ? (
                    <>
                      <div className='h-px w-full bg-zinc-200' />

                      <p className='p-2 text-xs text-zinc-500'>
                        Found {searchResults.results.length} results in{' '}
                        {searchResults?.duration.toFixed(0)}ms
                      </p>
                    </>
                  ) : null}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      </div>
    </main>
  );
}
