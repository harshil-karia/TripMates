import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConnectionService {
    constructor(
        private prisma: PrismaService,
        private authService: AuthService
    ) {}

    async getRequests(userId: number ) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user) {
            throw new UnauthorizedException('Invalid User')
        }

        const recievedRequest = await this.prisma.connection.findMany({
            where: {
                receiverUserId: userId
            }
        })

        const requestedRequest = await this.prisma.connection.findMany({
            where: {
                requesterUserId: userId
            }
        })

        const tokens = await this.authService.getTokens(userId,user.email)
        const at = tokens.access_token

        return {at,recievedRequest,requestedRequest}
    }
    
    async sendRequest(requesterId: number, receiverId: number) {
        const requesterUser = await this.prisma.user.findUnique({
            where: {
                id: requesterId
            }
        })

        if(!requesterUser) {
            throw new UnauthorizedException('Invalid User')
        }

        const receivingUser = await this.prisma.user.findUnique({
            where: {
                id: receiverId
            }
        })

        if(!receivingUser) {
            throw new NotFoundException("Can't send request as user not found")
        }

        const request = await this.prisma.connection.create({
            data: {
                requesterUserId: requesterId,
                receiverUserId: receiverId,                
            },
        })
        if(!request) {
            throw new InternalServerErrorException('Unable to send request')
        }

        const tokens = await this.authService.getTokens(requesterId,requesterUser.email)
        const at = tokens.access_token
        return {at, message:"Requested Successfully"}
    }
    
    async acceptRequest(requesterId: number, receiverId: number) {
        
        const receivingUser = await this.prisma.user.findUnique({
            where: {
                id: receiverId
            }
        })

        if(!receivingUser) {
            throw new UnauthorizedException('Invalid User')
        }

        const findRequest = await this.prisma.connection.findUnique({
            where: {
                requesterUserId_receiverUserId: {
                    requesterUserId: requesterId,
                    receiverUserId: receiverId,
                }
            }
        })

        if(!findRequest) {
            throw new NotFoundException('Request Not Found')
        }

        const updatedRequest = await this.prisma.connection.update({
            where: {
                id: findRequest.id
            },
            data: {
                status: 'ACCEPTED'
            }
        })
        if(updatedRequest.status != "ACCEPTED") {
            return new InternalServerErrorException("Unable to accept the request")
        }

        const tokens = await this.authService.getTokens(receiverId,receivingUser.email)
        const at = tokens.access_token
        return {at, message: "Request Accepted Successfully"}

    }
    
    async rejectRequest(requesterId: number, receiverId: number) {
        const receivingUser = await this.prisma.user.findUnique({
            where: {
                id: receiverId
            }
        })

        if(!receivingUser) {
            throw new UnauthorizedException('Invalid User')
        }

        const findRequest = await this.prisma.connection.findUnique({
            where: {
                requesterUserId_receiverUserId: {
                    requesterUserId: requesterId,
                    receiverUserId: receiverId,
                }
            }
        })

        if(!findRequest) {
            throw new NotFoundException('Request Not Found')
        }

        const updatedRequest = await this.prisma.connection.update({
            where: {
                id: findRequest.id
            },
            data: {
                status: 'REJECTED'
            }
        })
        if(updatedRequest.status != "REJECTED") {
            return new InternalServerErrorException("Unable to accept the request")
        }

        const tokens = await this.authService.getTokens(receiverId,receivingUser.email)
        const at = tokens.access_token
        return {at, message: "Request Accepted Successfully"}
    }

    async getConnectedUsers(userId: number) {
        const connections = await this.prisma.connection.findMany({
            where: {
                OR: [
                    {receiverUserId: userId},
                    {requesterUserId: userId}
                ],
                status: 'ACCEPTED'
            }
        })
        
        const connectedUserId = connections.map((connection) =>
            connection.receiverUserId === userId ? connection.requesterUserId: connection.receiverUserId
        )
        .filter(id => id !== undefined);

        if(!connectedUserId || connectedUserId.length===0) {
            return {}
        }

        const connectedUsers = await this.prisma.user.findMany({
            where: {
                id: {in: connectedUserId}
            }
        })
        return connectedUsers
    }
}
