export interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age: string;
  city: string;
  health: string;
  description: string;
  image: string;
  images: string[];
  owner: {
    username: string;
    avatar: string;
  };
}

