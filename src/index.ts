import dotenv from 'dotenv';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { ReadableStream } from 'node:stream/web';
import { addData, closeDb, defineDbTables } from './db';

dotenv.config();

const API_KEY = process.env.API_KEY as string;
const JACKETT_URL = process.env.JACKETT_URL;

async function searchTorrents(torrentName: string): Promise<Array<{ Title: string, Link: string, PublishDate: string, Guid: string }>> {
  const url = `${JACKETT_URL}?apikey=${API_KEY}&Query=${encodeURIComponent(torrentName)}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching torrents: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.Results || !data.Results.length) {
      console.log('No results found');
      return [];
    }

    // Map to a simple format or use the data as you wish
    const torrents = data.Results.map((torrent: any) => ({
      ...torrent,
    }));

    return torrents;

  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}


function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9-_\.]/g, '_');
}

async function downloadTorrentFile(downloadLink: string, fileName: string) {
  try {
    const response = await fetch(downloadLink);
    if (!response.ok || !response.body) {
      throw new Error(`Error downloading file: ${response.statusText}`);
    }

    const filePath = `./${sanitizeFilename(fileName)}.torrent`;

    const fileStream = fs.createWriteStream(filePath);
    await finished(Readable.fromWeb(response.body as ReadableStream).pipe(fileStream));

  } catch (error) {
    console.error('Error:', error);
  }
}

// Example usage
// searchTorrents('Arcane 2 4k').then(torrents => {
//   torrents.forEach((torrent: any) => {
//     console.log(`Title: ${torrent.Title}`);
//     console.log(`Size: ${torrent.Size}`);
//     console.log(`Seeders: ${torrent.Seeders}`);
//     console.log(`Magnet Link: ${torrent.Link}\n`);
//     console.log('Torrent:', torrent);
//   });
// });

async function run() {
  const torrents = await searchTorrents('Arcane 2 4k');

  defineDbTables();

  for (const torrent of torrents) {
    console.log('adding torrent to db', {
      title: torrent.Title,
      guid: torrent.Guid,
      publishDate: new Date(torrent.PublishDate),
    });
    addData(torrent.Guid, torrent.PublishDate);
  }

  closeDb();

  return

  for (const torrent of torrents) {
    console.log('Downloading', torrent.Title);

    await downloadTorrentFile(torrent.Link, torrent.Title);

    console.log('File downloaded', torrent.Title);
  }

}

run().catch(console.error);
