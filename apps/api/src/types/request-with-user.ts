import { UserRequest } from '~/types/user-request.type';

export type RequestWithUser = Request & {
  user: UserRequest;
};
