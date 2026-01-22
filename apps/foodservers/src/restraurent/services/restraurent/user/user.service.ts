// services/user/user.service.ts
import {
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface UserGrpcService {
  GetUserEmails(data: {
    page: number;
    limit: number;
    search?: string;
  }): any;
}

@Injectable()
export class UserService implements OnModuleInit {
  private userGrpcService: UserGrpcService;

  constructor(
    @Inject('AUTH_GRPC')
    private readonly grpcClient: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.userGrpcService =
      this.grpcClient.getService<UserGrpcService>('UserService');
  }

  async getUserEmails(payload: {
    page: number;
    limit: number;
    search?: string;
  }) {
    /**
     * payload example:
     * {
     *   page: 1,
     *   limit: 20,
     *   search: "gmail"
     * }
     */

    return firstValueFrom(
      this.userGrpcService.GetUserEmails({
        page: payload.page,
        limit: payload.limit,
        search: payload.search ?? '',
      }),
    );
  }
}
