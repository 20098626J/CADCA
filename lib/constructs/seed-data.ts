import { Actor, Movie, Role } from '../../shared/types';

export const SEED_MOVIES: Movie[] = [
  {
    movieId: 1234,
    title: 'The Shawshank Redemption',
    releaseDate: '1994-09-23',
    overview:
      'A banker convicted of uxoricide forms a friendship over a quarter century with a hardened convict, while maintaining his innocence and trying to remain hopeful through simple compassion.',
  },
  {
    movieId: 2001,
    title: 'Se7en',
    releaseDate: '1995-09-22',
    overview:
      'Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.',
  },
  {
    movieId: 5678,
    title: 'The Dark Knight',
    releaseDate: '2008-07-18',
    overview:
      'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
  },
];

export const SEED_ACTORS: Actor[] = [
  {
    actorId: 4321,
    name: 'Morgan Freeman',
    dateOfBirth: '1937-06-01',
    bio: 'An American actor, producer, and narrator. In a career spanning six decades, he has received numerous accolades, including an Academy Award and a Golden Globe Award.',
  },
  {
    actorId: 9911,
    name: 'Tim Robbins',
    dateOfBirth: '1958-10-16',
    bio: 'An American actor, screenwriter, director, producer, and musician, known for his work in both blockbuster and independent films.',
  },
  {
    actorId: 7788,
    name: 'Christian Bale',
    dateOfBirth: '1974-01-30',
    bio: 'An English actor known for his versatility and physical transformations for his roles, and has been a leading man in films of several genres.',
  },
  {
    actorId: 6655,
    name: 'Heath Ledger',
    dateOfBirth: '1979-04-04',
    bio: 'An Australian actor known for his roles on both stage and film, including his portrayal of the Joker in The Dark Knight, for which he won a posthumous Academy Award.',
  },
];

export const SEED_ROLES: Role[] = [
  {
    movieId: 1234,
    actorId: 4321,
    roleName: 'Ellis Boyd "Red" Redding',
    roleDescription:
      'Serves as the film\'s narrator, deuteragonist, and emotional anchor. As a seasoned inmate serving a life sentence, Red is the "man who can get things," a contraband smuggler who becomes the best friend and protector of Andy Dufresne.',
  },
  {
    movieId: 1234,
    actorId: 9911,
    roleName: 'Andy Dufresne',
    roleDescription:
      'A mild-mannered banker wrongly convicted of murdering his wife and her lover, who maintains his innocence and quiet hope throughout nearly two decades of imprisonment at Shawshank State Penitentiary.',
  },
  {
    movieId: 2001,
    actorId: 4321,
    roleName: 'Detective Lieutenant William Somerset',
    roleDescription:
      'A methodical, near-retirement homicide detective who is partnered with a younger detective to track down a serial killer obsessed with the seven deadly sins.',
  },
  {
    movieId: 5678,
    actorId: 7788,
    roleName: 'Bruce Wayne / Batman',
    roleDescription:
      'A billionaire industrialist who moonlights as the vigilante Batman, protecting Gotham City while grappling with the moral costs of his methods.',
  },
  {
    movieId: 5678,
    actorId: 6655,
    roleName: 'The Joker',
    roleDescription:
      'A psychopathic criminal mastermind who plunges Gotham City into anarchy, forcing Batman to confront the boundaries of his own moral code.',
  },
];
