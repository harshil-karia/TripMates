import { Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { GetCurrentUserId } from 'src/auth/common/decorator';
import { ConnectionService } from './connection.service';

@Controller('connection')
export class ConnectionController {
    constructor(
        private connectionService: ConnectionService
    ) {}
    @Get('getRequest')
    getRequests(@GetCurrentUserId() userId: number ) {
        return this.connectionService.getRequests(userId)
    }

    @Post('sendRequest/:id')
    sendRequest(
        @GetCurrentUserId() requesterId: number,
        @Param('id',ParseIntPipe) receiverId: number
    ) {
        return this.connectionService.sendRequest(requesterId,receiverId)
    }

    @Patch('accept/:id')
    acceptRequest(
        @Param('id',ParseIntPipe) requesterId: number,
        @GetCurrentUserId() receiverId: number
    ) {
        return this.connectionService.acceptRequest(requesterId,receiverId)
    }

    @Patch('reject/:id')
    rejectRequest(
        @Param('id',ParseIntPipe) requesterId: number,
        @GetCurrentUserId() receiverId: number
    ) {
        return this.connectionService.rejectRequest(requesterId,receiverId)
    }

    @Get('getConnections')
    getConnectedUsers(
        @GetCurrentUserId() userId: number
    ) {
        return this.connectionService.getConnectedUsers(userId)
    }
}
