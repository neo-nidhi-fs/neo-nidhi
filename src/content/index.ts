import defaultContent from './content.json';
import professionalContent from './contentPro.json';

export type ContentVariant = 'default' | 'pro';

const activeVariant =
  (process.env.NEXT_PUBLIC_CONTENT_VARIANT as ContentVariant | undefined) ?? 'default';

const content = activeVariant === 'pro' ? professionalContent : defaultContent;

export default content;
