// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.337
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["同心协力共襄伟业", "央视中秋晚会", "2025年诺贝尔生理学或医学奖揭晓", "快来接收来自中国空间站的中秋祝福", "诺贝尔奖奖金124年没花完", "男子旅游点炒蛏子和螃蟹两个菜661元", "网警提醒：假期过半安全不松懈", "湖南卫视中秋晚会", "卖不完的月饼都去哪儿了", "广东一对夫妇长得像复制粘贴", "全球最大冰山加速解体 或撑不过11月", "男子别车谎称公安 警方通报", "收花生找到姥姥丢了12年的金镯子", "丈母娘哽咽给新娘喂饺子 新郎秒变脸", "法国新总理辞职", "面馆默许高中生插队 排队游客发声", "伞伞伞伞兵马俑伞伞伞伞", "男子裸辞当媒婆5年撮合成功100多对", "#第一批返程大聪明已堵在路上#", "山东卫视中秋晚会", "5人进废弃矿硐遇难 急救人员发声", "副高异常强大 南北天气乱套了", "景区回应游客捡板栗壳被说成偷东西", "中国工程院院士勾画未来战机", "第一波月亮美图来了", "广东卫视中秋晚会", "男子国外遭抢劫 电脑挡下一枪", "中秋节为什么定在八月十五", "中甲一球员遭恶意犯规或致高位截瘫", "东方卫视中秋晚会", "香港海心公园割喉案嫌犯系流浪汉", "美防长谈披萨指数：想故意下单扰乱", "游客投喂胡萝卜 羊驼：真吃不动了", "男子花半年在“月球”复原广寒宫", "台风侵袭广西 气象台被“偷家”", "6辆解放牌大卡车护送接亲排面拉满", "马龙跳舞vs妻子跳舞 差距太明显", "假期里动物园的动物们都吃撑了", "本轮巴以冲突已致加沙67160人死亡", "解放军报中秋发文：始终绷紧战备弦", "TVB女演员胡定欣官宣结婚", "AI兔爷带你夜游赛博卢沟桥", "JDG开局6-1被DK翻盘", "梅德韦杰夫将率俄代表团访问朝鲜", "菲律宾一桥梁垮塌", "#今天中秋祝你花好月圆人团圆#", "北京皓月当空 绝美大片持续放送", "黄国昌批蔡适应恬不知耻", "云台山发生山体滑坡落石 景区回应", "黎耀祥景区“打工”再演刘醒", "青海门源多名徒步者受困 1人遇难"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
