import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Disable security warnings in dev if needed
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow: BrowserWindow | null = null;

const COMMON_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cookie': 'SOCS=CAESEwgDEgk2MTQyOTUwODcaAmVuIAEaBgiA_LyaBg',
};

function parseVideosFromAst(data: any): any[] {
  const videos: any[] = [];
  function traverse(obj: any) {
    if (!obj || typeof obj !== 'object') return;

    // Classic / Search video renderer
    if (obj.videoRenderer) {
      const v = obj.videoRenderer;
      const id = v.videoId;
      const title = v.title?.runs?.map((r: any) => r.text).join('') || v.title?.simpleText || '';
      const uploaderName =
        v.ownerText?.runs?.[0]?.text || v.shortBylineText?.runs?.[0]?.text || '';
      const uploaderId =
        v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || '';
      const uploaderAvatar =
        v.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail
          ?.thumbnails?.[0]?.url;
      const views =
        v.viewCountText?.simpleText || v.shortViewCountText?.simpleText || '';
      const durationFormatted = v.lengthText?.simpleText || '';
      const uploadedDate = v.publishedTimeText?.simpleText || '';
      const thumb =
        v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url ||
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      if (id && title) {
        videos.push({
          id,
          title,
          uploaderName,
          uploaderId,
          uploaderAvatar,
          views: views ? parseInt(views.replace(/[^0-9]/g, '')) || undefined : undefined,
          durationFormatted,
          uploadedDate,
          thumbnailUrl: thumb,
          isLive:
            !v.lengthText &&
            !!v.badges?.find(
              (b: any) =>
                b.metadataBadgeRenderer?.style === 'BADGE_STYLE_TYPE_LIVE_NOW'
            ),
        });
      }
      return;
    }

    // Modern Lockup View Model (used in secondary results & suggestions)
    if (obj.lockupViewModel) {
      const vm = obj.lockupViewModel;
      const id = vm.contentId;
      const title =
        vm.metadata?.lockupMetadataViewModel?.title?.content ||
        vm.accessibilityContext?.label ||
        '';
      const lines =
        vm.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel
          ?.metadataRows || [];
      const uploaderName = lines[0]?.metadataParts?.[0]?.text?.content || '';
      const views = lines[1]?.metadataParts?.[0]?.text?.content || '';
      const uploadedDate = lines[1]?.metadataParts?.[1]?.text?.content || '';
      const durationFormatted =
        vm.contentImage?.thumbnailViewModel?.overlays?.[0]
          ?.thumbnailOverlayTimeStatusRenderer?.text?.content || '';
      const thumb =
        vm.contentImage?.thumbnailViewModel?.image?.sources?.[0]?.url ||
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

      if (id && title) {
        videos.push({
          id,
          title,
          uploaderName,
          uploaderId: '',
          views: views ? parseInt(views.replace(/[^0-9]/g, '')) || undefined : undefined,
          durationFormatted,
          uploadedDate,
          thumbnailUrl: thumb,
          isLive: !durationFormatted && views.includes('watching'),
        });
      }
      return;
    }

    // Compact video renderer
    if (obj.compactVideoRenderer) {
      const v = obj.compactVideoRenderer;
      const id = v.videoId;
      const title = v.title?.runs?.map((r: any) => r.text).join('') || v.title?.simpleText || '';
      const uploaderName = v.shortBylineText?.runs?.[0]?.text || '';
      const views = v.viewCountText?.simpleText || v.shortViewCountText?.simpleText || '';
      const durationFormatted = v.lengthText?.simpleText || '';
      const uploadedDate = v.publishedTimeText?.simpleText || '';
      const thumb =
        v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url ||
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      if (id && title) {
        videos.push({
          id,
          title,
          uploaderName,
          uploaderId: '',
          views: views ? parseInt(views.replace(/[^0-9]/g, '')) || undefined : undefined,
          durationFormatted,
          uploadedDate,
          thumbnailUrl: thumb,
          isLive: false,
        });
      }
      return;
    }

    for (const k of Object.keys(obj)) {
      traverse(obj[k]);
    }
  }
  traverse(data);
  return videos;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    frame: false, // Frameless for custom modern titlebar
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0c',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow cross-origin video streaming
    },
    icon: path.join(__dirname, '../public/icon.png'),
  });

  // Set default window state handlers
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:state-changed', { isMaximized: true });
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:state-changed', { isMaximized: false });
  });

  // Open target="_blank" links in external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Load URL or build file
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Window Control IPC Handlers
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
  return mainWindow?.isMaximized();
});

ipcMain.handle('window:is-maximized', () => {
  return mainWindow?.isMaximized() ?? false;
});

ipcMain.handle('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('window:toggle-pip', (_event, enable: boolean) => {
  if (!mainWindow) return false;
  mainWindow.setAlwaysOnTop(enable, 'floating');
  if (enable) {
    mainWindow.setSize(480, 270);
  } else {
    mainWindow.setSize(1280, 820);
    mainWindow.center();
  }
  return enable;
});

ipcMain.handle('window:set-always-on-top', (_event, flag: boolean) => {
  mainWindow?.setAlwaysOnTop(flag, 'floating');
  return flag;
});

// Direct YouTube Data Scraper IPC Handlers
ipcMain.handle('api:get-trending', async (_event, category: string = 'all') => {
  try {
    let query = 'trending';
    if (category === 'music') query = 'trending music 2026';
    else if (category === 'gaming') query = 'trending gaming 2026';
    else if (category === 'technology') query = 'latest tech science news';
    else if (category === 'movies') query = 'new movie trailers 2026';
    else if (category === 'news') query = 'world news live today';

    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: COMMON_HEADERS });
    const html = await res.text();
    const match =
      html.match(/var ytInitialData = ({.*?});<\/script>/) ||
      html.match(/ytInitialData\s*=\s*({.+?});/);

    if (match) {
      const data = JSON.parse(match[1]);
      const videos = parseVideosFromAst(data);
      return { ok: true, data: videos };
    }
    return { ok: false, error: 'Could not parse feed' };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('api:search', async (_event, { query, sortBy = 'relevance' }: { query: string; sortBy?: string }) => {
  try {
    let url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    if (sortBy === 'upload_date') url += '&sp=CAI%253D';
    else if (sortBy === 'view_count') url += '&sp=CAM%253D';
    else if (sortBy === 'rating') url += '&sp=CAE%253D';

    const res = await fetch(url, { headers: COMMON_HEADERS });
    const html = await res.text();
    const match =
      html.match(/var ytInitialData = ({.*?});<\/script>/) ||
      html.match(/ytInitialData\s*=\s*({.+?});/);

    if (match) {
      const data = JSON.parse(match[1]);
      const videos = parseVideosFromAst(data);
      return { ok: true, data: videos };
    }
    return { ok: false, error: 'No results found' };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('api:get-suggestions', async (_event, query: string) => {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const json = await res.json();
    return { ok: true, data: json[1] || [] };
  } catch {
    return { ok: true, data: [] };
  }
});

ipcMain.handle('api:get-video', async (_event, videoId: string) => {
  try {
    // 1. Fetch base video metadata from watch page
    const url = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    const res = await fetch(url, { headers: COMMON_HEADERS });
    const html = await res.text();
    const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);

    let vDetails: any = {};
    if (playerMatch) {
      const player = JSON.parse(playerMatch[1]);
      vDetails = player.videoDetails || {};
    }

    // 2. Fetch related / suggested videos via Innertube Next endpoint
    let relatedVideos: any[] = [];
    try {
      const nextRes = await fetch(
        'https://www.youtube.com/youtubei/v1/next?prettyPrint=false',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': COMMON_HEADERS['User-Agent'],
            'Accept-Language': 'en-US,en;q=0.9',
          },
          body: JSON.stringify({
            context: {
              client: {
                clientName: 'WEB',
                clientVersion: '2.20240301.01.00',
                hl: 'en',
                gl: 'US',
              },
            },
            videoId,
          }),
        }
      );
      if (nextRes.ok) {
        const nextData = await nextRes.json();
        relatedVideos = parseVideosFromAst(
          nextData.contents?.twoColumnWatchNextResults?.secondaryResults || nextData
        );
      }
    } catch (e) {
      console.warn('[ZenTube] Error fetching next endpoint:', e);
    }

    const video = {
      id: videoId,
      title: vDetails.title || 'YouTube Video',
      description: vDetails.shortDescription || '',
      uploaderName: vDetails.author || 'Creator',
      uploaderId: vDetails.channelId || '',
      uploaderAvatar: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      views: parseInt(vDetails.viewCount) || undefined,
      duration: parseInt(vDetails.lengthSeconds) || 0,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      relatedVideos: relatedVideos.filter((v) => v.id !== videoId),
      formatStreams: [],
      adaptiveFormats: [],
      chapters: [],
      subtitles: [],
    };

    return { ok: true, data: video };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
});

// Comments Fetch IPC Handler
ipcMain.handle('api:get-comments', async (_event, videoId: string) => {
  try {
    // 1. Get continuation token for comments from next endpoint
    const nextRes = await fetch(
      'https://www.youtube.com/youtubei/v1/next?prettyPrint=false',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': COMMON_HEADERS['User-Agent'],
          'Accept-Language': 'en-US,en;q=0.9',
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240301.01.00',
              hl: 'en',
              gl: 'US',
            },
          },
          videoId,
        }),
      }
    );
    const nextData = await nextRes.json();

    let commentsToken: string | null = null;
    function findToken(obj: any) {
      if (!obj || typeof obj !== 'object' || commentsToken) return;
      if (obj.continuationCommand && obj.continuationCommand.token) {
        commentsToken = obj.continuationCommand.token;
        return;
      }
      for (const k of Object.keys(obj)) {
        findToken(obj[k]);
      }
    }
    findToken(nextData);

    if (!commentsToken) {
      return { ok: true, data: [] };
    }

    // 2. Fetch comments payload using the token
    const commRes = await fetch(
      'https://www.youtube.com/youtubei/v1/next?prettyPrint=false',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': COMMON_HEADERS['User-Agent'],
          'Accept-Language': 'en-US,en;q=0.9',
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240301.01.00',
              hl: 'en',
              gl: 'US',
            },
          },
          continuation: commentsToken,
        }),
      }
    );
    const commData = await commRes.json();
    const mutations = commData.frameworkUpdates?.entityBatchUpdate?.mutations || [];

    const comments: any[] = [];
    for (const m of mutations) {
      const payload = m.payload?.commentEntityPayload;
      if (payload) {
        comments.push({
          id: payload.commentId || Math.random().toString(),
          author: payload.author?.displayName || 'User',
          authorThumb: payload.author?.avatarThumbnailUrl,
          content: payload.properties?.content?.content || '',
          publishedText: payload.properties?.publishedTime || '',
          likeCount: payload.toolbar?.likeCountNotliked
            ? parseInt(payload.toolbar.likeCountNotliked) || 0
            : 0,
          isHearted: payload.toolbar?.isHearted || false,
          isPinned: payload.pinnedText ? true : false,
        });
      }
    }

    return { ok: true, data: comments };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('api:get-channel', async (_event, channelId: string) => {
  try {
    const url = `https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`;
    const res = await fetch(url, { headers: COMMON_HEADERS });
    const html = await res.text();
    const match =
      html.match(/var ytInitialData = ({.*?});<\/script>/) ||
      html.match(/ytInitialData\s*=\s*({.+?});/);

    if (match) {
      const data = JSON.parse(match[1]);
      const videos = parseVideosFromAst(data);
      const header = data.header?.c4TabbedHeaderRenderer || {};

      return {
        ok: true,
        data: {
          id: channelId,
          name: header.title || 'Creator',
          avatarUrl: header.avatar?.thumbnails?.[0]?.url,
          bannerUrl: header.banner?.thumbnails?.[0]?.url,
          subscriberCountText: header.subscriberCountText?.simpleText,
          videos,
        },
      };
    }
    return { ok: false, error: 'Channel not found' };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
});

// Proxy Fetch IPC fallback
ipcMain.handle('api:proxy-fetch', async (_event, { url, options }: { url: string; options?: RequestInit }) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': COMMON_HEADERS['User-Agent'],
        'Accept': 'application/json, text/plain, */*',
        ...(options?.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } else {
      const text = await response.text();
      return { ok: response.ok, status: response.status, data: text };
    }
  } catch (error: any) {
    return {
      ok: false,
      status: 500,
      error: error.message || 'Request failed',
    };
  }
});
