'use client';

import React from 'react';
import Dashboard from '@/app/components/Dashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-7xl px-4 py-6 flex flex-col items-center">
        <div className="flex justify-center w-full">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Backpack Hub</h1>
        </div>

        <main className="w-full">
          <Dashboard />      
        </main>
      </div>

      {/* Footer Section */}
      <footer className="w-full py-4 sm:py-6 mt-auto">
        <div className="container mx-auto px-4 flex flex-wrap gap-4 sm:gap-6 items-center justify-center">
          <a
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors text-white"
            href="https://twitter.com/chocoo_web3"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-twitter">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg>
            Chocoo
          </a>
        </div>
      </footer>
    </div>
  );
}