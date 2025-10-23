import { useEffect, useState } from "react";
import MovieCard from "./MovieCard.jsx";
import { shuffleArray } from "../helpers.js";

const API_KEY = "7306d561c7802269c242f2760aa1996e";
const BASE_URL = "https://api.themoviedb.org/3";

function Gameboard() {
    const [movies, setMovies] = useState(null);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [clickedCards, setClickedCards] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${Math.floor(Math.random() * 10) + 1}`)
            .then(response => response.json())
            .then(data => setMovies(data.results.slice(0, 10)))
            .catch(error => setError(error.message));
    }, []);

    if (!movies) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    function resetScores() {
        setScore(0);
        setClickedCards([]);
    }

    function handleCardClick(movie) {
        if (clickedCards.includes(movie.id)) {
            setBestScore(Math.max(bestScore, score));
            resetScores();
        } else {
            const newScore = score + 1;
            const newClickedCards = [...clickedCards, movie.id];

            setScore(newScore);
            setClickedCards(newClickedCards);
            setBestScore(Math.max(bestScore, newScore));

            if (newScore === movies.length) {
                console.log('bruh');

                alert("Congratulations! You've won the game!");
                resetScores();
            }
        }

        setMovies(prevMovies => shuffleArray(prevMovies));
    }

    return (
        <>
            <header>
                <h1>Memory Game</h1>
                <div className="scores">
                    <h2>Score: <span className="score">{score}</span></h2>
                    <h2>Best Score: <span className="best-score">{bestScore}</span></h2>
                </div>
            </header>
            <div className="gameboard">
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} handleCardClick={() => handleCardClick(movie)} />
                ))}
            </div>
        </>
    );
}

export default Gameboard;