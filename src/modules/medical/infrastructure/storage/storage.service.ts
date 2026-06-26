import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT') || 'localhost';
    const port = Number(this.configService.get('MINIO_PORT')) || 9000;
    const useSSL = this.configService.get('MINIO_USE_SSL') === 'true';
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY') || 'minio_admin';
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY') || 'minio_password';
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || 'his-dao-care';

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName);
        
        // Make the bucket public for reading files
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        console.log(`Minio bucket "${this.bucketName}" created and configured with public read policy.`);
      } else {
        console.log(`Minio bucket "${this.bucketName}" already exists.`);
      }
    } catch (error) {
      console.error('Minio bucket initialization failed:', error);
    }
  }

  async uploadFile(file: UploadedFile, folder = 'specialties'): Promise<string> {
    const fileExtension = file.originalname.split('.').pop() || 'png';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      }
    );

    const endPoint = this.configService.get<string>('MINIO_ENDPOINT') || 'localhost';
    const port = this.configService.get('MINIO_PORT');
    const useSSL = this.configService.get('MINIO_USE_SSL') === 'true';
    const protocol = useSSL ? 'https' : 'http';
    const portString = port ? `:${port}` : '';

    return `${protocol}://${endPoint}${portString}/${this.bucketName}/${fileName}`;
  }
}
