import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import * as microservices from '@nestjs/microservices';



/* =======================
   gRPC AUTH INTERFACE
======================= */
interface AuthGrpcService {

    GetUserEmails(data: {
        page: number;
        limit: number;
        search?: string;
    }): Observable<any>;

    UpdateUserRestaurant(data: {
        ownerEmail: string;
        restaurantId: string;
    }): Observable<any>;

    GetUserDetails(data: {
        userId: string;
    }): Observable<any>;
}

@Injectable()
export class ServicegrpcService {

    private authGRPCService: AuthGrpcService;

    constructor(
        @Inject('AUTH_GRPC')
        private readonly client: microservices.ClientGrpc,
    ) { }

    /* =======================
 INIT gRPC SERVICE
======================= */
    onModuleInit() {
        this.authGRPCService =
            this.client.getService<AuthGrpcService>('AuthService');
    }

    async getUserDetails(user: any) {
        let userDetails: any;
        try {
            userDetails = await firstValueFrom(
                this.authGRPCService.GetUserDetails({ userId: user.userId })
            );
        } catch (err) {
            throw new ServiceUnavailableException('Auth service not reachable');
        }
        return userDetails;
    }

}
