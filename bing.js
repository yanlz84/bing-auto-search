// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.458
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
var default_search_words = ["在都江堰感受中国“治”慧", "马克龙：此行只有一个遗憾", "3万亿元 “中部第一城”目标定了", "流感“排毒期”有多长？专家回应", "美一机器人公司欠中国代工厂25亿元", "国际空间站迎史上最拥挤时刻", "马克龙访华 法国送了一件特殊的礼物", "28岁柬埔寨公主大婚 曾在中国留学", "阻挠中国出席G7峰会 日本想多了", "多地推出新版旅游计次票", "1200年前中国人撸的是豹猫", "“新疆一县地震致人伤亡”不实", "处罚名单现“孙俪”等明星 当地通报", "黄仁勋赞华为：史上最强科技公司之一", "全国流感阳性率达51%", "中法元首非正式会晤为什么在都江堰", "美股三大指数小幅收涨", "女子跑外卖15个月出版12万字小说", "“娃衣”穿搭成潮玩标配 热销海外", "2026美加墨世界杯分组抽签结果出炉", "美发布国安新战略 出现重大战略转向", "李在明当场纠正女翻译口误", "香港通报大埔火灾调查最新进展", "漠河室内外温差已达60℃", "安徽“广德三件套”为啥这么火", "演员周柯宇官宣退出美国国籍", "马克龙与王楚钦孙颖莎打乒乓球", "阿富汗和巴基斯坦边境爆发激烈交火", "印度总统为普京举行国宴", "印媒发莫迪普京动画片 还恶搞特朗普", "胖东来招聘：50岁以下 年薪100万起", "地铁回应女子打翻奶茶用围巾擦净", "阿富汗和巴基斯坦边境爆发冲突", "美国打击所谓“运毒船”视频引哗然", "全网最忙五人组何以通过层层审核", "下周天气将有大转折", "“咸猪手”作案时被便衣民警生擒", "四川一地规定对相亲订婚进行监管", "中国航海家翟墨南极行途中遭遇抢劫", "又一个国家级新区“升级”了", "正直播NBA：热火vs魔术", "警方公告190万枚虚拟货币失主认领", "马克龙访问四川大学 法新社出图了", "驻日美军猥亵未成年少女 检方不起诉", "俄车臣首府遭袭 高楼被无人机炸大洞", "2025年度中国媒体十大热词发布", "马克龙：感谢中方热情款待", "摩尔线程上市首日大涨谁赢麻了", "秘鲁授权美军明年携武器入境", "长高1米 “尔滨”网红大雪人回归", "美法官下令公开爱泼斯坦案调查记录"]

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
