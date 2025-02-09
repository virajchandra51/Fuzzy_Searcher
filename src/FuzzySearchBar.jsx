import React, { useState } from "react";
import colleges from "./colleges"; // Import dataset

// College fuzzy search scoring weights
const COLLEGE_SCORE_WORD_MATCH = 20;
const COLLEGE_SCORE_WORD_BREAK_START = 10;
const COLLEGE_SCORE_WORD_BREAK_END = 5;
const COLLEGE_SCORE_ITEM_TITLE_MATCH = 10;
const COLLEGE_LIST_TRIM_LENGTH = 10;

// Function to calculate match score allowing word reordering
const calculateMatchScore = (query, item) => {
	if (!query) return 0;

	const queryWords = query.toLowerCase().split(" ");
	const itemWords = item.toLowerCase().split(" ");

	let totalScore = 0;

	queryWords.forEach((queryWord) => {
		let bestMatchScore = 0;

		itemWords.forEach((itemWord) => {
			let matchIndex = itemWord.indexOf(queryWord);
			let isFullWordMatch = itemWord === queryWord; // Check for exact word match
			let isWordBreakStart = matchIndex === 0; // Check if match is at the start of a word
			let isWordBreakEnd = matchIndex + queryWord.length === itemWord.length; // Match at end

			let score = 0;
			if (isFullWordMatch) {
				score += COLLEGE_SCORE_WORD_MATCH; // Highest priority for exact match
			}
			if (isWordBreakStart) {
				score += COLLEGE_SCORE_WORD_BREAK_START;
			}
			if (isWordBreakEnd) {
				score += COLLEGE_SCORE_WORD_BREAK_END;
			}
			if (matchIndex !== -1) {
				score += COLLEGE_SCORE_ITEM_TITLE_MATCH;
			}

			bestMatchScore = Math.max(bestMatchScore, score);
		});

		totalScore += bestMatchScore;
	});

	return totalScore;
};

// Function to perform fuzzy search with exact word prioritization
const fuzzySearch = (query, dataset) => {
	if (!query.trim()) return [];

	return dataset
		.map((item) => ({
			name: item,
			score: calculateMatchScore(query, item),
		}))
		.filter((result) => result.score > 10) // Remove non-matching items
		.sort((a, b) => b.score - a.score) // Sort by best score
		.map((result) => result.name).slice(0, COLLEGE_LIST_TRIM_LENGTH); // Return only names
};

const FuzzySearchBar = () => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);

	const handleSearch = (e) => {
		const input = e.target.value;
		setQuery(input);
		setResults(fuzzySearch(input, colleges));
	};

	return (
		<div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
			<input
				type="text"
				value={query}
				onChange={handleSearch}
				placeholder="Search colleges..."
				style={{
					width: "100%",
					padding: "8px",
					borderRadius: "5px",
					border: "1px solid #ccc",
				}}
			/>
			<ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
				{results.length > 0
					? results.map((college, index) => (
							<li key={index} style={{ padding: "5px 0" }}>
								{college}
							</li>
					  ))
					: query && <li>No results found</li>}
			</ul>
		</div>
	);
};

export default FuzzySearchBar;
