export interface Movie {
  movieId: number;
  title: string;
  releaseDate: string;
  overview: string;
}

export interface Actor {
  actorId: number;
  name: string;
  dateOfBirth: string;
  bio: string;
}

export interface Role {
  movieId: number;
  actorId: number;
  roleName: string;
  roleDescription: string;
}
