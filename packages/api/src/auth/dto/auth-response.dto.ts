import { UserDTO } from 'entry';

export class AuthResponseDTO {
  user: UserDTO;
  accessToken: string;
}
