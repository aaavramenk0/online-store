import { Module, Global } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';

@Global()
@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
  controllers: [CloudinaryController]
})
export class CloudinaryModule { }
