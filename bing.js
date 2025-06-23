// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.127
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
var default_search_words = ["“中国人要把饭碗端在自己手里”", "广东清远发生4.3级地震", "清远地震 广州深圳等地有震感", "机器人竞争开启“抢人”模式", "于东来：将关闭多家胖东来门店", "普京访华将停留4天 俄方：非常罕见", "净网2025|低俗直播“斗狠”4人被罚", "知情人士：美驻叙利亚军事基地遭袭", "男孩中考查分863分数学满分", "普京会见伊朗外长：愿提供协助", "高考查分", "“清华经管院长曹玉磊”系假冒", "全红婵追网约车大喊：师傅你别动", "伊方：将放手采取任何行动打击美军", "美警告伊朗不要关闭霍尔木兹海峡", "清远4.3级地震 学生下楼避险", "男生被教官体罚做1000深蹲致换肾", "中方回应伊朗拟关闭霍尔木兹海峡", "伊朗关闭霍尔木兹海峡会怎样", "霍尔木兹海峡会是伊朗的“杀手锏”吗", "曝千万粉丝男明星隐婚生子还出轨", "上海商业街门头连片坍塌 官方通报", "被狗咬未就医 3个月后发病去世", "全国各地高考成绩查分时间", "伊朗称向以色列发起第21轮打击", "以色列称伊朗再次发射弹道导弹", "以军称袭击伊朗6个机场", "雷军：小米YU7 6月26日正式发布", "原来成龙刚出生就出名了", "上海2025高考分数线出炉", "《酱园弄》豆瓣开分5.9", "落马副部刘跃进受贿1.21亿被判死缓", "景区漂移事件车主出镜道歉", "宁波东方理工大学回应学费9.6万", "雷霆4-3步行者夺NBA总冠军", "清华食堂菜单堪比学术论文", "伊朗导弹袭击导致以部分城镇停电", "以色列再次袭击伊朗福尔多核设施", "伊朗新一轮对以色列空袭持续40分钟", "伊朗外长：美国袭击挑战国际秩序", "给学生吃发臭排骨？当地教体局回应", "以军猛烈空袭德黑兰 多地发生爆炸", "俄称有国家准备向伊朗提供核弹头", "第30届上海电视节今日开幕", "以军高调展示战果震慑伊朗", "柬埔寨公主现身深圳吃椰子鸡", "美呼吁中国劝阻伊朗封锁霍尔木兹", "伊朗使用新型导弹打击以色列", "今年第2号台风“圣帕”已生成", "程序员住车里 被质疑占用公共资源", "柯丝蒂·考文垂接任国际奥委会主席"]

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
