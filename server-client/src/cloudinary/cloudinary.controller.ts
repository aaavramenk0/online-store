import { Body, Controller, Delete, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

import { AtGuard } from 'src/common/guard';



@UseGuards(AtGuard)
@Controller('cloud')
export class CloudinaryController {
  constructor(private cloudinaryService: CloudinaryService) { }

  @Post('/upload')
  uploadFile(@Body("file") file: File | string, @Query('folder') folder: string) {
    return this.cloudinaryService.upload(file, folder)
  }


  @Delete("/destroy/:key")
  deleteFile(@Param('key') key: string) {
    return this.cloudinaryService.destroy(key)
  }
}
