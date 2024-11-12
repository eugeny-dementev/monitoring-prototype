import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY as string;
const JACKETT_URL = process.env.JACKETT_URL;

async function searchTorrents(torrentName: string) {
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
      title: torrent.Title,
      size: torrent.Size,
      seeders: torrent.Seeders,
      link: torrent.Link,
      downloadLink: torrent.MagnetUri
    }));

    return torrents;

  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Example usage
searchTorrents('Arcane 2 4k').then(torrents => {
  torrents.forEach((torrent: any) => {
    console.log(`Title: ${torrent.title}`);
    console.log(`Size: ${torrent.size}`);
    console.log(`Seeders: ${torrent.seeders}`);
    console.log(`Magnet Link: ${torrent.link}\n`);
  });
});
