import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";



@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, 'oauth') {
    constructor() {
        super({
            authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenURL: 'https://oauth2.googleapis.com/token',
            clientID: '1053194840391-3uts1geb4gmoe9lf4akuvmhqm35tpbl9.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: 'http://localhost:3500/auth/google/callback',
            scope: ['email', 'profile']
        })
    }


    async validate(accessToken: string, refreshToken: string, profile: any, done:VerifyCallback) {
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
        console.log('Profile:', profile);
        return {
            accessToken,
            refreshToken,
        }
    }
}