export type I18nArgs = string | number | boolean | JSX.Element | unknown;

export type TI18nBasic = string | boolean | number;

/**
 * 键位类型检查 必须符合三个语言包都包含提供键位
 */
export type TI18nKeyType<T extends object, S extends keyof T> = S extends S
  ? T[S] extends TI18nBasic
    ? `${S & TI18nBasic}`
    : `${S & TI18nBasic}.${TI18nKeyType<T[S] & object, keyof T[S]>}`
  : never;

interface ILanguage {
  [name: string]: ILanguage | string;
}

export type TranslateFN<TKeys, T extends I18nArgs = I18nArgs> = (
  key: TKeys,
  ...args: NotUnJSXObject<T>[]
) => ReturnI18nType<T>;

/**
 * 返回类型限制为 string | JSX.Element
 */
export type ReturnI18nType<T> = T extends JSX.Element
  ? JSX.Element
  : T extends object
  ? never
  : T extends boolean | number | string | unknown
  ? string
  : never;

export type NotUnJSXObject<T> = T extends JSX.Element
  ? JSX.Element
  : T extends object
  ? never
  : T;

export class I18n<
  Language extends Record<string, P>,
  P extends ILanguage,
  T = unknown
> {
  /**
   * 当前使用的语言包
   */
  private currentLanguage: P;

  public static create<
    Language extends Record<string, P>,
    P extends ILanguage,
    T = unknown
  >(
    langs: Language,
    defaultLanguage: keyof Language,
    formatJSX: (data: I18nArgs[]) => T = () => {
      throw new Error("formatJSX not defined");
    }
  ) {
    return new I18n(langs, defaultLanguage, formatJSX);
  }

  private constructor(
    readonly langs: Language,
    public readonly defaultLanguage: keyof Language,
    public readonly formatJSX: (data: I18nArgs[]) => T = () => {
      throw new Error("formatJSX not defined");
    }
  ) {
    this.currentLanguage = langs[defaultLanguage];
    if (!this.currentLanguage) {
      throw new Error(
        `i18n langs init error: default lang "${
          defaultLanguage as string
        }" not exist in input langs !!!`
      );
    }
  }

  /**
   * 获取模板
   */
  private getTemplate = (
    language: ILanguage,
    key: string
  ): string | ILanguage | undefined => {
    const [first, ...path] = key.split(".");
    return path.reduce(
      (acc, name) => (typeof acc === "object" ? acc[name] : acc),
      language[first]
    );
  };

  public translateLanguage = <T,>(
    language: ILanguage,
    key: string,
    ...args: NotUnJSXObject<T>[]
  ): ReturnI18nType<T> => {
    const value = this.getTemplate(language, key);
    if (typeof value === "undefined") {
      console.error(`i18n ERROR: ${key} not exist`);
      return "" as ReturnI18nType<T>;
    }

    if (typeof value !== "string") {
      console.error(`i18n ERROR: ${key} ${value} is not string.`);
      return "" as ReturnI18nType<T>;
    }

    const match = Array.from(value.matchAll(/{(\d+)}/g));

    if (!args.length || !match.length) {
      return value as ReturnI18nType<T>;
    }

    const response = match.reduce(
      (data, item, index, all) => {
        const v = item[1];
        const i = item.index ?? 0;

        // 前置获取
        const start = data.prev
          ? (data.prev.index ?? 0) + data.prev[0].length
          : 0;
        const vs = value.slice(start, i);
        if (vs) {
          data.data.push(vs);
        }

        data.data.push(args[Number(v)] ?? "");

        data.prev = item;

        // 后置获取
        if (index === all.length - 1) {
          const end = (data.prev.index ?? 0) + data.prev[0].length;
          const vs = value.slice(end, value.length);
          if (vs) {
            data.data.push(vs);
          }
        }

        return data;
      },
      { data: [] } as { data: I18nArgs[]; prev?: RegExpMatchArray }
    );

    if (args.some((item) => typeof item === "object")) {
      return (this.formatJSX?.(response.data) || "") as ReturnI18nType<T>;
    }

    return response.data.join("") as ReturnI18nType<T>;
  };

  private getKey = (key: string, prefix: string) => {
    if (!prefix || prefix === "default") {
      return key;
    }
    return `${prefix}.${key}`;
  };

  private getKeys = (obj: ILanguage, prefix = ""): string[] => {
    const keys: string[] = [];
    Object.keys(obj).forEach((k) => {
      if (typeof obj[k] === "string") {
        keys.push(this.getKey(k, prefix));
      } else {
        keys.push(...this.getKeys(obj[k] as ILanguage, this.getKey(k, prefix)));
      }
    });
    return keys;
  };

  public translate = <T,>(
    key: string,
    ...args: NotUnJSXObject<T>[]
  ): ReturnI18nType<T> => {
    return this.translateLanguage(this.currentLanguage, key, ...args);
  };
}
