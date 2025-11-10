import { UserDTO } from '@repo/api';

export type RequestWithUser = Request & {
  user: UserDTO;
};
