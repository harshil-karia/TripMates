import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {v2 as cloudinary} from 'cloudinary'

@Injectable()
export class CloudinaryService {
    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: configService.get('CLOUDINARY_API_SECRET')
        })
    }
    

    async uploadOnCloudinary(loaclFilePath: string) {
        try {
            if(!loaclFilePath) {
                throw new ForbiddenException('Unable to upload the file')
            }
            const response = await cloudinary.uploader.upload(loaclFilePath,{
                folder: 'uploads'
            });
            return response
        } catch (error) {
            throw new ForbiddenException('Unable to upload file on cloudinary',error)   
        }
    }

    async deleteFromCloudinary(public_id: string) {
        try {
            if(!public_id) {
                throw new ForbiddenException('No public id found')
            }
            const response = await cloudinary.uploader.destroy(public_id)
            return response
        } catch (error) {
            throw new ForbiddenException('Unable to delete image',error)
        }
    }
}
