import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';

const disk = env.MIXPOST_DISK ?? 'local';

const s3 = disk === 's3'
	? new S3Client({
			region: env.AWS_DEFAULT_REGION ?? 'us-east-1',
			credentials: {
				accessKeyId: env.AWS_ACCESS_KEY_ID!,
				secretAccessKey: env.AWS_SECRET_ACCESS_KEY!
			}
		})
	: null;

const localBasePath = env.STORAGE_PATH ?? './storage';

export async function putFile(path: string, data: Buffer, contentType?: string): Promise<string> {
	if (disk === 's3' && s3) {
		await s3.send(
			new PutObjectCommand({
				Bucket: env.AWS_BUCKET!,
				Key: path,
				Body: data,
				ContentType: contentType
			})
		);
		return `https://${env.AWS_BUCKET}.s3.amazonaws.com/${path}`;
	}
	const fullPath = join(localBasePath, path);
	await mkdir(join(fullPath, '..'), { recursive: true });
	await writeFile(fullPath, data);
	return `/storage/${path}`;
}

export async function getFile(path: string): Promise<Buffer> {
	if (disk === 's3' && s3) {
		const result = await s3.send(
			new GetObjectCommand({ Bucket: env.AWS_BUCKET!, Key: path })
		);
		return Buffer.from(await result.Body!.transformToByteArray());
	}
	return readFile(join(localBasePath, path));
}

export async function deleteFile(path: string): Promise<void> {
	if (disk === 's3' && s3) {
		await s3.send(
			new DeleteObjectCommand({ Bucket: env.AWS_BUCKET!, Key: path })
		);
		return;
	}
	await unlink(join(localBasePath, path)).catch(() => {});
}
