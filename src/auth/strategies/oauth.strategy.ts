import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";



@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, 'oauth') {
    constructor(
        private config: ConfigService
    ) {
        super({
            authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenURL: 'https://oauth2.googleapis.com/token',
            clientID: config.get('CLIENT_ID'),
            clientSecret: config.get('CLIENT_SECRET'),
            callbackURL: 'https://tripmates-production.up.railway.app/auth/google/callback',
            scope: ['email', 'profile']
        })
    }


    //Still save user and all work is remaining
    async validate(accessToken: string, refreshToken: string, profile: any, done:VerifyCallback) {
        // console.log('Access Token:', accessToken);
        // console.log('Refresh Token:', refreshToken);
        //console.log('Profile:', profile);
        //console.log(profile.emails[0].value)
        return {
            accessToken,
            refreshToken,
            profile
        }
    }
}