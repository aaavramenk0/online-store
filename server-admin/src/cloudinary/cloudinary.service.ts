import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary'
import { Image as TypeImage } from '@prisma/client';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})



@Injectable()
export class CloudinaryService {
  public async upload(image: File | string, folder?: string): Promise<TypeImage> {
    try {
      const data_url =
        typeof image === 'string' ? image : await this.getDataURl(image)
      const uploadedImage = await cloudinary.uploader.upload(data_url, {
        folder: `agricultureShop${folder ? `/${folder}` : ''}`
      })

      return {
        url: uploadedImage.url,
        key: uploadedImage.public_id
      }
    } catch (err) {
      throw new BadRequestException('Failed to upload an image.' + err)
    }
  }

  public async destroy(imageId: string) {
    try {
      await cloudinary.uploader.destroy(imageId)
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to destroy an image.' + err
      )
    }
  }


  private async getDataURl(image: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert file to URL'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsDataURL(image)
    })
  }
}
