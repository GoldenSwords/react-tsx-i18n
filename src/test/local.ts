import { I18n, I18nArgs, NotUnJSXObject, ReturnI18nType, TI18nKeyType } from '../i18n';
import { en, tw, zh } from './language';

export const AllLanguage = {
  zh: zh,
  en: en,
  tw: tw,
};

type TLanguage = typeof zh | typeof en | typeof tw;

type TKeys = TI18nKeyType<TLanguage, keyof TLanguage>;

const trans = I18n.create(AllLanguage, 'zh').translate;

export default <T extends I18nArgs = unknown>(
  key: TKeys,
  ...args: NotUnJSXObject<T>[]
): ReturnI18nType<T> => trans(key, ...args);
