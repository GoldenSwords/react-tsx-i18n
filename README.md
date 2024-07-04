# React-tsx-i18n 语言包

```

import { I18n, I18nArgs, NotUnJSXObject, RetureI18nType, TI18nKeyType } from 'react-tsx-i18n';

const zhCn = { a: { title: '标题' } };
const enUs = { a: { title: 'title' } };

type TLanguage = typeof zhCn | typeof enUs;

const all = {
  zhCn, enUs
};

/**
 * all 所有语言包
 * zhCn 当前语言包
 * @params jsx 允许插入jsx代码
 *
 */
const translate = I18n.create(all, 'zhCn', (jsx)=><>{jsx}</>).translate;

export default <T extends I18nArgs = unknow>(key: TKeys, ...args: NotUnJSXObject<T>[]): ReturnI18nType<T> => translate(key, ...args);



```

```
import translate from './local';

translate('a.title', '我是标题');
translate('a.title', 1);
translate('a.title', <span>我是标题</span>);
```
