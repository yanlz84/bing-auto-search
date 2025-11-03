// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.392
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
var default_search_words = ["更好的中国 造福亚太和世界", "曝光！间谍在中国搜集亲本种子", "全红婵伤愈首秀夺冠", "迎接神二十回家 东风着陆场准备就绪", "央视起底兼职骗局黑色产业链", "观众为全红婵下起“娃娃雨”", "最快纪录世界唯一！中国科技捷报频传", "当心结石变癌 这俩高危饮食习惯速改", "无意说的这些话可能是孩子自卑源头", "人形机器人为啥进步“神速”？", "区委书记沉迷游戏区长沉迷高尔夫", "女航天员回地球后禁止生育系谣言", "美方：美军机连续坠入南海并非巧合", "王世坚街头献唱《没出息》", "发育迟缓儿童发病率逐年上升", "双胞胎姐妹玩石头剪刀布默契度100%", "九旬夫妻结婚78年从不吵架", "全红婵回应复出夺冠：我真棒", "舰载无人直升机性能有多强？解读来了", "空中盛宴！一起看南昌飞行大会现场", "荒野求生“冷美人”美甲睫毛仍坚挺", "年轻人低价抢购倒闭车企烂尾车", "男子自称“玉皇大帝”敛财500万被抓", "矿工得知老婆生产 满身乌黑赶到医院", "武志红：总是“重情义”家庭过不好", "正直播NBA：公牛vs尼克斯", "学校回应女生买淀粉肠被拿走钥匙", "林佳龙宴请美国官员 无人到场", "无人机低飞观鸟撞死大雁 民警回应", "“雨雨雪雪冷冷”模式即将开启", "正直播NBA：76人vs篮网", "WTT蒙彼利埃冠军赛：王艺迪女单夺冠", "全红婵完美三跳 观众尖叫声不断", "十五运会跳水项目首金花落广东队", "中国有自己的“钢铁侠”", "网友把神二十一发射拍成“窜天猴”", "印度发射该国迄今最重卫星", "荒野求生赛选手吃烧红泥土治拉肚子", "七星山荒野求生退回“陶器时代”", "莫雷加德WTT男单冠军", "特朗普：未认真考虑向乌提供“战斧”", "阿富汗发生6.4级地震", "泰州登顶苏超 书记进更衣室道贺", "持澳大利亚签证可免签入境新西兰", "美国俄亥俄州发生枪击事件 9人受伤", "美移民执法人员“碰瓷”抓人遭围堵", "大同通报保障房10年未完工整改进展", "法官直播帮债务人卖螃蟹？法院回应", "狼队一穿四晋级年总决赛", "全红婵左手缠满胶布", "苏超夺冠 泰州多景区免票"]

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
