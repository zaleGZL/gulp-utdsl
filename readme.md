# gulp-utdsl

UTDSL(Util Test Domain Specific Language) 是一套单元测试领域专用语言，通过使用 utdsl 可以高效地编写测试用例，开发者只需要像写配置文件一样来写测试用例即可。

## 什么是 UTDSL

UTDSL(Util Test Domain Specific Language) 是一套单元测试领域专用语言，用于描述测试用例的一种语言。

1. 为什么要使用 UTDSL

    单元测试是前端开发中的很重要的一部分，它是检验我们写的代码是否足够健壮，严谨的一种方式。

    在我们的日常开发中，我们都需要编写测试用例，并且还是维护之前写的旧测试用例，我们每个人写的测试多少有些不同，可能还会带有一定的特殊逻辑，而且也没有一个统一的编写规范，那么如何去保证我们每个人写的测试用例对于其他的开发同学来说能够快速看懂并修改就成为了一个需要解决的问题。

    在多数团队中，单元测试还有一些指标，比如某次代码的提交中，改动的代码的语句覆盖率、分支覆盖率、函数覆盖率和行覆盖率要达到某一个指标才能合并到主干上。从中可以看出，单元测试在我们的日常开发扮演着越来越重要的角色，是必不可少的一部分。

    对于编写测试用例的时间，可能会占据不少我们开发该需求的时间，有时候我们在开发该需求的时候，都需要把编写测试用例的时间给估算下，不然覆盖率达不到要求，代码还没法提交，可见编写测试用例确实花费了不少时间，那么如何将这部分时间给缩短也成功了 UTDSL 要解决的一个问题。

    那么 UTDSL 如何解决以上问题呢？

    首先，测试框架是有多重多样的，比如 `enzyme`, `jest`, `react-testing-library` 等，可能再过几年就会有新的测试框架出现，那么对于开发者又需要去学习新的框架，新的 API 等，这也增加了学习的成本。而通过编写 UTDSL，开发者无需去关注底层所用的测试框架和语法，只需学习 UTDSL 这一种语法，就能够写测试用例了。

    一个测试用例，涉及的核心概念如下：

    - io: 输入和输出
    - invokeType: 调用类型（或调用方式）
    - mock: 需要 Mock 的数据或者函数
    - expect: 预期行为

    任何一个测试用例基本都会包括以上四点，并且测试用例也会有些写法上有共同点，而 UTDSL 的核心原理就是将最佳的测试用例代码抽象成一种 DSL，这样开发者就能像写配置文件一样来写测试用例了。

    UTDSL 是写在 YML 文件中，之所以选择 YML 是因为这门配置语言足够简洁和强大，而且写起来远远比 JSON 要方便。

    写一个最简单的测试配置文件（测试一个两数相加的函数）：

    ```yml
    # index.test.yml
    path: '../index.ts'
    cases:
        - target: add
          io:
              - '(1, 2) --> 3'
              - '(3, 4) --> 7'
    ```

    其实从字面上就可以看出这个配置文件的含义，非常容易理解，`path` 即被测试的文件路径，`target` 为被测试的对象，`io` 表示对应的输入和输出。

    通过 gulp-utdsl 工具，就会自动生成如下的代码。

    ```javascript
    import { add } from '../../../src/index.ts';

    test('add_two_number', async () => {
        jest.clearAllMocks();
        expect(add(1, 2)).toBe(3);
        expect(add(3, 4)).toBe(7);
    });
    ```

    就这样一个简单的测试用例就让我们少写了很多测试代码，而且无需关心底层是如何操作的，这样编写的测试用例更加容易维护并且易懂。

2. UTDSL 的优势

    - 无需学习多种测试框架的语法，只需学习 UTDSL 一种语法
    - 规范化测试配置文件的编写，同时这也反过来使得代码要编写得利于测试，形成反向约束
    - 降低编写测试用例的时间成本
    - 统一管理测试数据

3. UTDSL 的劣势

    - 需要学习 YML 语言（这个相信大家应该都会吧，就是一个配置语言，后台开发同学应该比较熟悉）
    - 需要学习一门新的语法（UTDSL）

        学习一种语法和学习三种语法，大多数人肯定选择前者的。 而且 UTDSL 的语法都是非常简单的，比测试框架的 API 简单多了

## 如何使用

一：安装 gulp-utdsl 和 gulp

```bash
npm install gulp-utdsl gulp --save-dev
```

二：配置 gulp 任务

```javascript
const gulp = require('gulp');
const utdsl = require('gulp-utdsl');
const needUtdslFilePath = ['src/**/*.test.yaml', 'src/**/*.test.yml'];
gulp.task('utdsl', () => {
    return gulp.src(needUtdslFilePath).pipe(utdsl());
});
gulp.task(
    'utdsl:watch',
    gulp.series('utdsl', () => {
        return gulp.watch(needUtdslFilePath).on('change', function (obj) {
            return gulp.src(obj).pipe(utdsl());
        });
    })
);
```

然后执行 `npm run utdsl:watch` 命令。

三：编写测试用例 yml 文件

创建 `*.test.yml` 的文件，然后就可以开始写测试配置文件了。

## [基本语法](./doc/intro.md)

## [项目配置](./doc/config.md)

## [TODO](./doc/todo.md)
