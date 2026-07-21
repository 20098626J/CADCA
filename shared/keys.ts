// Single-table design key prefixes.
// Movie   -> PK = m#movieId,  SK = m#movieId
// Actor   -> PK = a#actorId,  SK = a#actorId
// Role    -> PK = m#movieId,  SK = a#actorId

export const moviePartitionKey = (movieId: number) => `m#${movieId}`;
export const actorPartitionKey = (actorId: number) => `a#${actorId}`;

export const movieKey = (movieId: number) => ({
  PK: moviePartitionKey(movieId),
  SK: moviePartitionKey(movieId),
});

export const actorKey = (actorId: number) => ({
  PK: actorPartitionKey(actorId),
  SK: actorPartitionKey(actorId),
});

export const roleKey = (movieId: number, actorId: number) => ({
  PK: moviePartitionKey(movieId),
  SK: actorPartitionKey(actorId),
});
