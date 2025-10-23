const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function MovieCard({ movie, handleCardClick }) {
    return (
        <div className="card" onClick={handleCardClick}>
            <img
                src={`${IMAGE_BASE}${movie.poster_path}`}
                alt={movie.title}
            />
            <h3>{movie.title}</h3>
        </div>
    );
}

export default MovieCard;