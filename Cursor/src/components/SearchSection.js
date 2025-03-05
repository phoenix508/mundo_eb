import React, { useState } from 'react';

const SearchSection = () => {
    const [searchResults, setSearchResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchWikipedia = async (searchTerm) => {
        setIsLoading(true);
        setError(null);

        try {
            // First, try to get an exact match using the opensearch API
            const response = await fetch(
                `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchTerm)}&limit=1&namespace=0&format=json&origin=*`
            );
            const [term, titles, descriptions, urls] = await response.json();

            // If no exact match is found
            if (titles.length === 0) {
                setError('No exact match found. Please try a different search term.');
                setSearchResults(null);
                return;
            }

            // Get more details about the page
            const pageResponse = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(titles[0])}&format=json&origin=*`
            );
            const pageData = await pageResponse.json();
            const page = Object.values(pageData.query.pages)[0];
            const extract = page.extract.split('.')[0] + '.'; // Get first sentence

            setSearchResults({
                title: titles[0],
                extract,
                url: urls[0]
            });
        } catch (error) {
            setError('Error fetching results. Please try again.');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const searchTerm = e.target.elements.search.value.trim();
        if (searchTerm) {
            searchWikipedia(searchTerm);
        }
    };

    return (
        <section id="destinations" className="py-20">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12 text-white">
                        Find Your Perfect Destination
                    </h2>
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <input
                                type="text"
                                name="search"
                                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-br from-grey/10 to-grey/20 backdrop-blur-md border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search destinations..."
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors text-white"
                            >
                                Search
                            </button>
                        </form>

                        <div className="mt-6">
                            {isLoading && (
                                <div className="text-center text-white">Searching...</div>
                            )}
                            {error && (
                                <div className="text-center text-white">{error}</div>
                            )}
                            {searchResults && (
                                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
                                    <h3 className="text-2xl font-semibold mb-4 text-white">
                                        {searchResults.title}
                                    </h3>
                                    <p className="text-gray-300 mb-6">{searchResults.extract}</p>
                                    <a
                                        href={searchResults.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                                    >
                                        Read More on Wikipedia
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 text-center">
                            <h3 className="text-xl font-semibold mb-4 text-white">
                                Popular Destinations
                            </h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                {['Paris', 'New York', 'Tokyo'].map((city) => (
                                    <a
                                        key={city}
                                        href={`https://en.wikipedia.org/wiki/${city}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        {city}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SearchSection; 