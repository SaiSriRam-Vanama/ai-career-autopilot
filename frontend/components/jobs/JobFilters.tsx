'use client';

import { Search, MapPin, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface JobFiltersProps {
    onSearch: (query: string, location: string) => void;
    loading?: boolean;
}

export default function JobFilters({ onSearch, loading }: JobFiltersProps) {
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query, location);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl glass bg-card shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Job title, keywords, or company"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
            </div>

            <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location (e.g. Remote, New York)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 bg-primary hover:bg-primary/90 h-11"
            >
                {loading ? 'Searching...' : 'Find Jobs'}
            </Button>


        </form>
    );
}
