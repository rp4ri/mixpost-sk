import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db.js';
import { media } from '$lib/server/schema/index.js';
import { putFile } from '$lib/server/storage.js';
import { randomUUID } from 'crypto';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	if (!file) return json({ error: 'No file provided' }, { status: 400 });

	const buffer = Buffer.from(await file.arrayBuffer());
	const uuid = randomUUID();
	const ext = file.name.split('.').pop() ?? 'bin';
	const path = `media/${uuid}.${ext}`;

	const fileUrl = await putFile(path, buffer, file.type);

	const [result] = await db.insert(media).values({
		name: file.name,
		mimeType: file.type,
		disk: process.env.MIXPOST_DISK ?? 'local',
		path,
		size: buffer.length,
		sizeTotal: buffer.length
	}).returning({ id: media.id, uuid: media.uuid });

	return json({ id: result.id, uuid: result.uuid, url: fileUrl, name: file.name });
};
