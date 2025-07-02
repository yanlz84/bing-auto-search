// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.144
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
var default_search_words = ["想人民之所想 行人民之所嘱", "万斯一票破局 美参院通过大而美法案", "女生高考462分 超北大录取分150多", "直升机悬挂五星红旗飞过香港上空", "胡塞武装：用高超音速导弹袭击以色列", "特朗普与马斯克“口水战”升级", "烟台海面变“草原”了", "陈赫回应鹿晗暴瘦", "保时捷女销冠又成销冠：半年卖近百台", "郑钦文连续3年温网一轮游", "多架歼-20起飞迎敌逼退外机", "贵州榕江洪灾致13死？谣言", "牛弹琴：这是全世界最轰动的分手大戏", "特朗普：不考虑延长关税谈判最后期限", "惊险一幕 印尼一客机着陆时险坠毁", "郑钦文回应温网出局", "河南西峡强降雨 超800人投入救援", "董晴靠自己火出圈了", "为何对充电宝发紧急通知？民航局回应", "俄方允许“不友好国家”投资者投资", "佩通坦总理职务被停后还有机会吗", "水均益晒出身份证辟谣移民", "古早万能充电器竟仍在热卖", "胡一天两年没进组 幽默回应：退休了", "河南西峡强降雨遇难人数上升至5人", "虐猫考生上岸失败系道德品行等问题", "特斯拉股价跌超5%", "洪森：泰国对柬埔寨领土有野心", "7岁男孩对小猴竖中指遭猴子群殴", "暴雨大雾强对流 中央气象台预警齐发", "中使馆提醒中国公民暂勿前往伊朗", "特朗普批评日本不接受美国大米", "俄希望阿塞拜疆尽快释放被拘俄记者", "猫眼就误放周杰伦演唱会回流票致歉", "特斯拉中国涨价", "洪水退去村超球场重新亮灯", "李福贵自曝19岁结婚一年后分开", "贝索斯抛售亚马逊股票 套现超50亿元", "韩国6月份通胀加速 升至五个月高点", "男子自称考古人却直播带货？多方回应", "美国暂停向乌提供部分承诺的军火", "马里多地遇袭 击毙80多名恐怖分子", "伊朗称过去两周逮捕50余名以方人员", "土耳其逮捕最大反对党成员在内102人", "巴媒：以军袭击加沙造成至少51人死亡", "杨千嬅称不反对儿子进入娱乐圈", "花旗聘请前野村控股资深投资银行家", "王欣瑜晋级温网女单第二轮", "重庆退休民警捡腰包内有60余万韩币", "各国央行官员探讨储备货币格局", "贝森特催促中国加快稀土出口"]

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
