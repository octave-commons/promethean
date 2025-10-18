export async function create({
  title,
  files,
  delegates,
  client,
}: {
  title?: string;
  files?: string[];
  delegates?: string[];
  client: any;
}) {
  try {
    const { data: session, error } = await client.session.create({
      title,
      files,
      delegates,
    });

    if (error) return `Failed to create session: ${error}`;
    if (!session) return 'No session created';

    return JSON.stringify({
      success: true,
      session: {
        id: session.id,
        title: session.title,
        createdAt: session.time?.created || session.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error creating session:', error);
    return `Failed to create session: ${error.message}`;
  }
}
