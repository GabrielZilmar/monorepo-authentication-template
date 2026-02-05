import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import SessionRepository from '~/services/database/typeorm/repositories/session.repository';
import { UseCase } from '~/shared/core/use-case';
import { TOKEN_EXPIRATION } from '~/modules/auth/constants';

type RefreshTokenParams = { refreshToken: string };
type RefreshTokenResponse = { accessToken: string };

@Injectable()
export default class RefreshToken
  implements UseCase<RefreshTokenParams, RefreshTokenResponse>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute({
    refreshToken,
  }: RefreshTokenParams): Promise<RefreshTokenResponse> {
    const session =
      await this.sessionRepository.findByRefreshToken(refreshToken);

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.deactivateSession(session.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    if (!session.isActive) {
      throw new UnauthorizedException('Session is no longer active');
    }

    await this.sessionRepository.updateLastUsed(session.id);

    const payload = {
      sub: session.userId,
      email: session.user.email,
      sessionId: session.id,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: `${TOKEN_EXPIRATION.ACCESS_TOKEN}h`,
    });

    return { accessToken };
  }
}
