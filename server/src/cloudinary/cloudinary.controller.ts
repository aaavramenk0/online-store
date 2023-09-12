import { Body, Controller, Delete, Param, Post, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

import { AtGuard } from 'src/common/guard';
import { ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('cloud')
@UseGuards(AtGuard)
@Controller('cloud')
export class CloudinaryController {
  constructor(private cloudinaryService: CloudinaryService) { }

  @ApiResponse({
    description: "File has successfully uploaded",
    status: HttpStatus.CREATED
  })
  @Post('/upload')
  @HttpCode(HttpStatus.CREATED)
  uploadFile(@Body("file") file: File | string, @Query('folder') folder?: string) {
    return this.cloudinaryService.upload(file, folder)
  }

  @ApiResponse({
    description: "File has successfully deleted",
    status: HttpStatus.NO_CONTENT
  })
  @Delete("/destroy/:key")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteFile(@Param('key') key: string) {
    return this.cloudinaryService.destroy(key)
  }
}
