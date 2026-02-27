import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query as string)}`
    );
    console.log('response ==> ', response);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from Wikipedia' },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      title: data.title,
      summary: data.extract || 'No summary available',
      thumbnail: data.thumbnail?.source || null,
      url: data.content_urls?.desktop?.page || null,
    });
  } catch (error: unknown) {
    console.log('error ==> ', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
