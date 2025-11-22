// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.430
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
var default_search_words = ["这是总书记勉励体育健儿的高频词", "日本再次面临抉择", "山西发现一座距今4300年“宫城”", "盘点十五运会值得铭记的“再见”", "高市早苗惹恼马来西亚民众", "男生穿裙子跑步夺冠被学校取消成绩", "中国驻北马其顿大使馆发公开信警告", "小雪至 冬始俏", "巴拿马议员计划“窜台” 巴总统表态", "中国驻日使馆重申敌国条款", "中方回应“乌称摧毁中国制造武器”", "地球将进入小冰河期系误区", "美欧爆发激烈争吵", "日本民众抗议：不要让日本陷入危险", "日本遭高市妄为之“祸”", "俄发布日本1945年投降画面警告日本", "缅甸官方回应日本涉台错误言论", "中方就高市错误言行致函古特雷斯", "日本演员古川雄辉发文致歉", "出现这些不适可能是甲醛超标", "小雪节气哪些地方将迎来初雪", "两高中生奸杀女教师案申诉被驳回", "胡彦斌回应亲吻照：不是AI", "女孩被母亲男友多次强奸 男子获刑", "民警卧底传销组织 疯狂洗脑场面曝光", "霸王茶姬创始人辟谣：此前未有过婚姻", "印度国产光辉战机在迪拜航展坠毁", "日本首相官邸外抗议人数剧增", "信用卡3年减少9000多万张 你还用吗", "墨西哥选手获环球小姐冠军 曾遭辱骂", "“最美”女大校当选院士", "印度坠毁光辉战机飞行员已死亡", "意大利艺术家金马桶拍出1210万美元", "巴印空军在迪拜航展罕见互动引热议", "泽连斯基称乌克兰面临艰难选择", "特朗普给泽连斯基“最后期限”", "中国再取代美国 成德国最大贸易伙伴", "12306回应高铁不卖卫生巾", "江科大郭某团队博士：他从未上过课", "小雪后新一股冷空气将到来", "“大湾鸡”和机器人跳广播体操了", "画家在树洞作画后被城管责令涂掉", "男装店把吊牌做成超大鼠标垫", "佛山秋假“鱼档少年”刮鱼鳞走红", "“南郭先生”为何会成为首席科学家", "骑手丢车后深夜赶路5公里登门致歉", "中国军号连续5天在海外发视频", "正直播NBA：步行者vs骑士", "70秒回顾十五运会闭幕式精彩瞬间", "小雪：落雪为念 愿君冬安", "刚果（金）东部遭多起武装袭击"]

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
