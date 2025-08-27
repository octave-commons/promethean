// import { PostMessage } from '@shared/prom-lib';

export function createPostMessage(
  provider: string,
  tenant: string,
  spaceUrn: string,
  text: string,
  inReplyTo?: string,
  //TODO fix this
) {
  // : PostMessage
  return {
    provider,
    tenant,
    space_urn: spaceUrn,
    in_reply_to: inReplyTo,
    text,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // eslint-disable-next-line no-console
  console.log(
    createPostMessage(
      "discord",
      "duck",
      "urn:discord:space:duck:123",
      "Hello world from cephalon-discord",
    ),
  );
}
